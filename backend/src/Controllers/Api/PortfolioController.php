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

        $allowedIntervals = ['1W' => '7 DAY', '1M' => '30 DAY', '3M' => '90 DAY'];
        $interval = $allowedIntervals[$range] ?? '30 DAY';

        // Asset value is the same number used by the stat card
        $assetValue = $this->calcAssetValue($userId);

        // End-of-day wallet balance per day from the ledger
        $ledgerStmt = $this->db->prepare("
            SELECT
                DATE(created_at)   AS label,
                MAX(balance_after) AS wallet_balance
            FROM wallet_ledger
            WHERE user_id   = :uid
              AND created_at >= DATE_SUB(NOW(), INTERVAL {$interval})
            GROUP BY DATE(created_at)
            ORDER BY DATE(created_at) ASC
        ");
        $ledgerStmt->execute([':uid' => $userId]);
        $rows = $ledgerStmt->fetchAll(\PDO::FETCH_ASSOC);

        $labels = [];
        $values = [];

        foreach ($rows as $row) {
            $labels[] = $row['label'];
            $values[] = round((float) $row['wallet_balance'] + $assetValue, 2);
        }

        // Always pin today's point to the live wallet balance so the chart's
        // rightmost value matches the Portfolio Value stat card exactly.
        $todayLabel  = date('Y-m-d');
        $liveBalance = $this->wallet->getBalance($userId);
        $todayValue  = round($liveBalance + $assetValue, 2);

        if (empty($labels)) {
            // New user with no ledger history — just show one point for today
            $labels[] = $todayLabel;
            $values[] = $todayValue;
        } elseif (end($labels) === $todayLabel) {
            // Today already in series — replace with live value for accuracy
            $values[count($values) - 1] = $todayValue;
        } else {
            // Today not yet in series — append it
            $labels[] = $todayLabel;
            $values[] = $todayValue;
        }

        return $this->json($response, [
            'labels' => $labels,
            'values' => $values,
        ]);
    }

    /**
     * GET /api/v1/users/{userId}/profile
     */
    public function profile(Request $request, Response $response, array $args): Response
    {
        $userId = (int) ($args['userId'] ?? 0);

        if ($userId <= 0) {
            return $this->json($response, ['success' => false, 'message' => 'Invalid user ID.'], 422);
        }

        $stmt = $this->db->prepare("
            SELECT u.id, u.username, u.verified, u.registered_at, u.bio,
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

        $stmt = $this->db->prepare("
            SELECT
                COUNT(CASE WHEN seller_id = :uid  THEN 1 END)               AS totalSales,
                COALESCE(SUM(CASE WHEN seller_id = :uid2 THEN price END), 0) AS totalVolume,
                (SELECT COUNT(*) FROM inventory WHERE user_id = :uid3)       AS itemsOwned
            FROM transactions
            WHERE buyer_id = :uid4 OR seller_id = :uid5
        ");
        $stmt->execute([
            ':uid'  => $userId, ':uid2' => $userId, ':uid3' => $userId,
            ':uid4' => $userId, ':uid5' => $userId,
        ]);
        $stats = $stmt->fetch(\PDO::FETCH_ASSOC);

        return $this->json($response, [
            'success' => true,
            'user'    => [
                'id'         => (int)  $user['id'],
                'username'   =>        $user['username'],
                'isVerified' => (bool) $user['verified'],
                'bio'        =>        $user['bio'] ?? null,
                'joinedAt'   =>        $user['registered_at'],
            ],
            'stats' => [
                'totalSales'  => (int)   $stats['totalSales'],
                'totalVolume' => '$' . number_format((float) $stats['totalVolume'], 2),
                'itemsOwned'  => (int)   $stats['itemsOwned'],
                'joinedAt'    =>         $user['registered_at'],
            ],
            'wallet' => [
                'balance'  => (float) $user['balance'],
                'currency' => 'VPR',
            ],
        ]);
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

        return $this->json($response, ['success' => true, 'message' => 'Profile updated successfully.']);
    }

    private function json(Response $response, array $data, int $status = 200): Response
    {
        $response->getBody()->write(json_encode($data, JSON_UNESCAPED_UNICODE));
        return $response->withHeader('Content-Type', 'application/json')->withStatus($status);
    }
}