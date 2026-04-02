<?php
namespace App\Controllers\Api;

use App\Services\AuthService;
use App\Services\WalletService;
use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;

class PortfolioController
{
    private \PDO          $db;
    private AuthService   $auth;
    private WalletService $wallet;

    public function __construct(\PDO $db, AuthService $auth, WalletService $wallet)
    {
        $this->db     = $db;
        $this->auth   = $auth;
        $this->wallet = $wallet;
    }

    /**
     * Shared helper — calculates total asset market value for a user.
     *
     * Priority order (identical to PageController::dashboard):
     *   1. Last transaction price  — most recent sale on the platform
     *   2. Other sellers' floor   — lowest active listing, own listings excluded
     *   3. Zero                   — never traded, no external listings
     *
     * Extracted into a method so portfolio(), portfolioHistory(), and
     * PageController all use provably identical logic.
     */
    private function calcAssetValue(int $userId): float
    {
        $stmt = $this->db->prepare("
            SELECT COALESCE(SUM(
                COALESCE(
                    (
                        SELECT t.price
                        FROM transactions t
                        WHERE t.asset_id = a.id
                        ORDER BY t.completed_at DESC
                        LIMIT 1
                    ),
                    (
                        SELECT MIN(l.price)
                        FROM listings l
                        WHERE l.asset_id   = a.id
                          AND l.status     = 'active'
                          AND l.seller_id != :excludeUid
                    ),
                    0
                )
            ), 0) AS asset_total
            FROM inventory i
            JOIN assets a ON a.id = i.asset_id
            WHERE i.user_id = :uid
        ");
        $stmt->execute([':uid' => $userId, ':excludeUid' => $userId]);
        return (float) $stmt->fetchColumn();
    }

    /**
     * GET /api/v1/user/portfolio
     */
    public function portfolio(Request $request, Response $response): Response
    {
        $user   = $this->auth->getCurrentUser();
        $userId = (int) $user['id'];

        $stmt = $this->db->prepare("
            SELECT
                i.id            AS inventory_id,
                i.acquired_at,
                a.id            AS asset_id,
                a.name          AS asset_name,
                a.rarity,
                a.condition_state,
                a.image_url,
                a.collection,
                COALESCE(
                    (
                        SELECT t.price
                        FROM transactions t
                        WHERE t.asset_id = a.id
                        ORDER BY t.completed_at DESC
                        LIMIT 1
                    ),
                    (
                        SELECT MIN(l.price)
                        FROM listings l
                        WHERE l.asset_id   = a.id
                          AND l.status     = 'active'
                          AND l.seller_id != :excludeUid
                    ),
                    0
                ) AS market_value
            FROM inventory i
            JOIN assets a ON a.id = i.asset_id
            WHERE i.user_id = :userId
            ORDER BY i.acquired_at DESC
        ");
        $stmt->execute([':userId' => $userId, ':excludeUid' => $userId]);

        return $this->json($response, [
            'success'   => true,
            'portfolio' => $stmt->fetchAll(\PDO::FETCH_ASSOC),
            'count'     => $stmt->rowCount(),
        ]);
    }

    /**
     * GET /api/v1/user/transactions
     */
    public function transactions(Request $request, Response $response): Response
    {
        $user   = $this->auth->getCurrentUser();
        $userId = (int) $user['id'];

        $stmt = $this->db->prepare("
            SELECT
                t.id,
                t.price,
                t.completed_at,
                a.name          AS asset_name,
                a.rarity,
                a.image_url,
                buyer.username  AS buyer_username,
                seller.username AS seller_username,
                CASE
                    WHEN t.buyer_id  = :userIdCase  THEN 'buy'
                    WHEN t.seller_id = :userIdCase2 THEN 'sell'
                END AS role
            FROM transactions t
            JOIN assets a         ON a.id      = t.asset_id
            JOIN users  buyer     ON buyer.id  = t.buyer_id
            JOIN users  seller    ON seller.id = t.seller_id
            WHERE t.buyer_id = :buyerId OR t.seller_id = :sellerId
            ORDER BY t.completed_at DESC
            LIMIT 50
        ");
        $stmt->execute([
            ':userIdCase'  => $userId,
            ':userIdCase2' => $userId,
            ':buyerId'     => $userId,
            ':sellerId'    => $userId,
        ]);

        return $this->json($response, [
            'success'      => true,
            'transactions' => $stmt->fetchAll(\PDO::FETCH_ASSOC),
        ]);
    }

    /**
     * GET /api/v1/user/wallet
     */
    public function wallet(Request $request, Response $response): Response
    {
        $user   = $this->auth->getCurrentUser();
        $userId = (int) $user['id'];

        return $this->json($response, [
            'success' => true,
            'wallet'  => [
                'balance' => $this->wallet->getBalance($userId),
                'ledger'  => $this->wallet->getLedger($userId, 20),
            ],
        ]);
    }

    /**
     * GET /api/v1/dashboard/activity
     */
    public function activity(Request $request, Response $response): Response
    {
        $user   = $this->auth->getCurrentUser();
        $userId = (int) $user['id'];

        $stmt = $this->db->prepare("
            SELECT
                t.id,
                t.price                                                    AS amount,
                t.completed_at                                             AS createdAt,
                a.name                                                     AS assetName,
                CASE WHEN t.buyer_id = :uid  THEN 'buy' ELSE 'sell' END   AS type,
                CASE WHEN t.buyer_id = :uid2
                     THEN seller.username ELSE buyer.username END          AS counterparty
            FROM transactions t
            JOIN assets a       ON a.id      = t.asset_id
            JOIN users  buyer   ON buyer.id  = t.buyer_id
            JOIN users  seller  ON seller.id = t.seller_id
            WHERE t.buyer_id = :uid3 OR t.seller_id = :uid4
            ORDER BY t.completed_at DESC
            LIMIT 20
        ");
        $stmt->execute([
            ':uid'  => $userId, ':uid2' => $userId,
            ':uid3' => $userId, ':uid4' => $userId,
        ]);

        $activities = array_map(fn($r) => [
            'id'           => 'act-' . $r['id'],
            'type'         => $r['type'],
            'assetName'    => $r['assetName'],
            'amount'       => (float) $r['amount'],
            'counterparty' => $r['counterparty'],
            'createdAt'    => $r['createdAt'],
        ], $stmt->fetchAll(\PDO::FETCH_ASSOC));

        return $this->json($response, ['activities' => $activities]);
    }

    /**
     * GET /api/v1/dashboard/portfolio-history?range=1W|1M|3M
     *
     * Each chart data point = end-of-day wallet balance + current asset market value.
     *
     * Asset value uses calcAssetValue() — identical priority logic to the PHP stat card.
     * This guarantees the rightmost chart point always matches Portfolio Value in the UI.
     *
     * Today's point is always derived from the LIVE wallet balance (not ledger snapshot)
     * so it stays in sync with the stat card even if the user transacts mid-session.
     */
        public function portfolioHistory(Request $request, Response $response): Response
    {
        $user   = $this->auth->getCurrentUser();
        $userId = (int) $user['id'];
        $range  = $request->getQueryParams()['range'] ?? '1M';

        $allowedIntervals = ['1W' => 7, '1M' => 30, '3M' => 90];
        $days = $allowedIntervals[$range] ?? 30;

        $assetValue  = $this->calcAssetValue($userId);
        $liveBalance = $this->wallet->getBalance($userId);

        // Fetch all ledger entries in window (oldest first)
        $stmt = $this->db->prepare("
            SELECT DATE(created_at) AS day, MAX(balance_after) AS wallet_balance
            FROM wallet_ledger
            WHERE user_id   = :uid
            AND created_at >= DATE_SUB(NOW(), INTERVAL :days DAY)
            GROUP BY DATE(created_at)
            ORDER BY DATE(created_at) ASC
        ");
        $stmt->execute([':uid' => $userId, ':days' => $days]);
        $rows = $stmt->fetchAll(\PDO::FETCH_KEY_PAIR); // [date => balance]

        // Get the last known balance BEFORE the window (for carry-forward start value)
        $stmtPrior = $this->db->prepare("
            SELECT balance_after FROM wallet_ledger
            WHERE user_id = :uid
            AND created_at < DATE_SUB(NOW(), INTERVAL :days DAY)
            ORDER BY created_at DESC
            LIMIT 1
        ");
        $stmtPrior->execute([':uid' => $userId, ':days' => $days]);
        $priorBalance = (float) ($stmtPrior->fetchColumn() ?: 0);

        // Generate every day in the window, carrying forward last known balance
        $labels = [];
        $values = [];
        $lastBalance = $priorBalance;

        for ($i = $days; $i >= 1; $i--) {
            $date = date('Y-m-d', strtotime("-{$i} days"));
            if (isset($rows[$date])) {
                $lastBalance = (float) $rows[$date];
            }
            $labels[] = $date;
            $values[] = round($lastBalance + $assetValue, 2);
        }

        // Pin today with live balance
        $today = date('Y-m-d');
        $todayValue = round($liveBalance + $assetValue, 2);
        if (end($labels) === $today) {
            $values[count($values) - 1] = $todayValue;
        } else {
            $labels[] = $today;
            $values[] = $todayValue;
        }

        // If no history at all, just show today
        if ($priorBalance === 0.0 && empty($rows)) {
            $labels = [$today];
            $values = [$todayValue];
        }

        return $this->json($response, ['labels' => $labels, 'values' => $values]);
    }

    /**
 * GET /api/v1/users/{userId}/profile
 *
 * Public fields: user, stats
 * Owner-only fields: wallet, bank
 */
    public function profile(Request $request, Response $response, array $args): Response
    {
        $userId = (int) ($args['userId'] ?? 0);

        if ($userId <= 0) {
            return $this->json($response, ['success' => false, 'message' => 'Invalid user ID.'], 422);
        }

        // ── 1. User + wallet (single query) ──────────────────────────────────
        $stmt = $this->db->prepare("
            SELECT
                u.id,
                u.username,
                u.verified,
                u.registered_at,
                u.bio,
                COALESCE(w.balance, 0.00) AS balance
            FROM users u
            LEFT JOIN wallets w ON w.user_id = u.id
            WHERE u.id = :id
            LIMIT 1
        ");
        $stmt->execute([':id' => $userId]);
        $user = $stmt->fetch(\PDO::FETCH_ASSOC);

        if (!$user) {
            return $this->json($response, ['success' => false, 'message' => 'User not found.'], 404);
        }

        // ── 2. Stats ──────────────────────────────────────────────────────────
        $stmt = $this->db->prepare("
            SELECT
                COUNT(CASE WHEN seller_id = :uid1 THEN 1 END)                AS totalSales,
                COUNT(CASE WHEN buyer_id  = :uid2 THEN 1 END)                AS totalPurchases,
                COALESCE(SUM(CASE WHEN seller_id = :uid3 THEN price END), 0) AS totalVolume,
                (SELECT COUNT(*) FROM inventory WHERE user_id = :uid4)       AS itemsOwned
            FROM transactions
            WHERE buyer_id = :uid5 OR seller_id = :uid6
        ");
        $stmt->execute([
            ':uid1' => $userId, ':uid2' => $userId, ':uid3' => $userId,
            ':uid4' => $userId, ':uid5' => $userId, ':uid6' => $userId,
        ]);
        $stats = $stmt->fetch(\PDO::FETCH_ASSOC);

        // ── 3. Bank account (owner-only) ──────────────────────────────────────
        $currentUser   = $this->auth->getCurrentUser();
        $currentUserId = $currentUser ? (int) $currentUser['id'] : 0;
        $isOwner       = ($currentUserId === $userId);

        $bank = null;
        if ($isOwner) {
            $stmt = $this->db->prepare("
                SELECT bank_name, account_number, holder_name
                FROM bank_accounts
                WHERE user_id = :uid
                LIMIT 1
            ");
            $stmt->execute([':uid' => $userId]);
            $row = $stmt->fetch(\PDO::FETCH_ASSOC);

            if ($row) {
                $bank = [
                    'bankName'      => $row['bank_name'],
                    // Mask all but last 4 digits for security
                    'accountNumber' => '****-' . substr($row['account_number'], -4),
                    'holderName'    => $row['holder_name'],
                ];
            }
        }

        // ── 4. Build response ─────────────────────────────────────────────────
        $payload = [
            'success' => true,
            'user'    => [
                'id'         => (int)  $user['id'],
                'username'   =>        $user['username'],
                'isVerified' => (bool) $user['verified'],
                'bio'        =>        $user['bio'] ?? null,
                'joinedAt'   =>        $user['registered_at'],
            ],
            'stats'   => [
                'totalSales'     => (int)   $stats['totalSales'],
                'totalPurchases' => (int)   $stats['totalPurchases'],
                'totalVolume'    => '$' . number_format((float) $stats['totalVolume'], 2),
                'itemsOwned'     => (int)   $stats['itemsOwned'],
                'joinedAt'       =>         $user['registered_at'],
            ],
        ];

        // Wallet + bank only returned to the account owner
        if ($isOwner) {
            $payload['wallet'] = [
                'balance'  => (float) $user['balance'],
                'currency' => 'VPR',
            ];
            $payload['bank'] = $bank; // null if no bank account saved yet
        }

        return $this->json($response, $payload);
    }

    /**
     * PATCH /api/v1/users/{userId}/profile
     */
    public function updateProfile(Request $request, Response $response, array $args): Response
    {
        $userId        = (int) ($args['userId'] ?? 0);
        $currentUser   = $this->auth->getCurrentUser();
        $currentUserId = (int) $currentUser['id'];

        if ($userId !== $currentUserId) {
            return $this->json($response, ['success' => false, 'message' => 'You can only edit your own profile.'], 403);
        }

        $data        = $request->getParsedBody() ?? [];
        $displayName = trim($data['displayName'] ?? '');
        $bio         = trim($data['bio']         ?? '');

        if (strlen($displayName) > 30) {
            return $this->json($response, ['success' => false, 'message' => 'Display name must be 30 characters or fewer.'], 422);
        }
        if (strlen($bio) > 150) {
            return $this->json($response, ['success' => false, 'message' => 'Bio must be 150 characters or fewer.'], 422);
        }

        // After length validation, before the UPDATE:
        if ($displayName && $displayName !== $currentUser['username']) {
            $check = $this->db->prepare(
                "SELECT id FROM users WHERE username = :username AND id != :id LIMIT 1"
            );
            $check->execute([':username' => $displayName, ':id' => $userId]);
            if ($check->fetch()) {
                return $this->json($response, [
                    'success' => false,
                    'message' => 'This username is already taken.',
                ], 409);
            }
        }

        $stmt = $this->db->prepare(
            "UPDATE users SET username = :username, bio = :bio WHERE id = :id"
        );
        $stmt->execute([
            ':username' => $displayName ?: $currentUser['username'],
            ':bio'      => $bio,
            ':id'       => $userId,
        ]);

         $_SESSION['username'] = $displayName ?: $currentUser['username'];
        return $this->json($response, ['success' => true, 'message' => 'Profile updated successfully.']);
    }

    private function json(Response $response, array $data, int $status = 200): Response
    {
        $response->getBody()->write(json_encode($data, JSON_UNESCAPED_UNICODE));
        return $response->withHeader('Content-Type', 'application/json')->withStatus($status);
    }


    public function upsertBank(Request $request, Response $response, array $args): Response
    {
        $userId      = (int) ($args['userId'] ?? 0);
        $currentUser = $this->auth->getCurrentUser();

        if ($userId !== (int) $currentUser['id']) {
            return $this->json($response, ['success' => false, 'message' => 'Forbidden.'], 403);
        }

        $data       = $request->getParsedBody() ?? [];
        $bankName   = trim($data['bankName']       ?? '');
        $accountNum = trim($data['accountNumber']  ?? '');
        $holderName = trim($data['holderName']     ?? '');

        if (!$bankName || !$accountNum || !$holderName) {
            return $this->json($response, ['success' => false, 'message' => 'All fields required.'], 422);
        }

        $stmt = $this->db->prepare("
            INSERT INTO bank_accounts (user_id, bank_name, account_number, holder_name)
            VALUES (:uid, :bank, :acct, :holder)
            ON DUPLICATE KEY UPDATE
                bank_name      = VALUES(bank_name),
                account_number = VALUES(account_number),
                holder_name    = VALUES(holder_name)
        ");
        $stmt->execute([
            ':uid'    => $userId,
            ':bank'   => $bankName,
            ':acct'   => $accountNum,
            ':holder' => $holderName,
        ]);

        return $this->json($response, ['success' => true, 'message' => 'Bank account saved.']);
    }



    // PortfolioController
    public function deposit(Request $request, Response $response): Response
    {
        $user   = $this->auth->getCurrentUser();
        $userId = (int) $user['id'];
        $data   = $request->getParsedBody() ?? [];
        $amount = round((float) ($data['amount'] ?? 0), 2);

        if ($amount <= 0 || $amount > 10000) {
            return $this->json($response, ['success' => false, 'message' => 'Amount must be between $0.01 and $10,000.'], 422);
        }

        try {
            $this->db->beginTransaction();

            $stmt = $this->db->prepare("SELECT balance FROM wallets WHERE user_id = :uid FOR UPDATE");
            $stmt->execute([':uid' => $userId]);
            $wallet = $stmt->fetch(\PDO::FETCH_ASSOC);
            $before = (float) $wallet['balance'];
            
            $this->wallet->credit(
                $userId, $amount, 'wallet_topup',
                'TOPUP-' . $userId . '-' . time(),
                $before
            );

            $this->db->commit();
            return $this->json($response, [
                'success'     => true,
                'message'     => 'Funds added.',
                'newBalance'  => round($before + $amount, 2),
            ]);
        } catch (\Exception $e) {
            $this->db->rollBack();
            return $this->json($response, ['success' => false, 'message' => 'Deposit failed.'], 500);
        }
    }
}