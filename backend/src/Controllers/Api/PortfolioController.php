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
                        SELECT MIN(l.price)
                        FROM listings l
                        WHERE l.asset_id = a.id
                          AND l.status   = 'active'
                    ),
                    (
                        SELECT t.price
                        FROM transactions t
                        WHERE t.asset_id = a.id
                        ORDER BY t.completed_at DESC
                        LIMIT 1
                    ),
                    0
                ) AS market_value
            FROM inventory i
            JOIN assets a ON a.id = i.asset_id
            WHERE i.user_id = :userId
            ORDER BY i.acquired_at DESC
        ");

        $stmt->execute([':userId' => $userId]);
        $items = $stmt->fetchAll(\PDO::FETCH_ASSOC);

        return $this->json($response, [
            'success'   => true,
            'portfolio' => $items,
            'count'     => count($items),
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
                END             AS role
            FROM transactions t
            JOIN assets a           ON a.id       = t.asset_id
            JOIN users  buyer       ON buyer.id   = t.buyer_id
            JOIN users  seller      ON seller.id  = t.seller_id
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
        $txns = $stmt->fetchAll(\PDO::FETCH_ASSOC);

        return $this->json($response, [
            'success'      => true,
            'transactions' => $txns,
            'count'        => count($txns),
        ]);
    }

    /**
     * GET /api/v1/user/wallet
     */
    public function wallet(Request $request, Response $response): Response
    {
        $user   = $this->auth->getCurrentUser();
        $userId = (int) $user['id'];

        $balance = $this->wallet->getBalance($userId);
        $ledger  = $this->wallet->getLedger($userId, 20);

        return $this->json($response, [
            'success' => true,
            'wallet'  => [
                'balance' => $balance,
                'ledger'  => $ledger,
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
                t.price                                                          AS amount,
                t.completed_at                                                   AS createdAt,
                a.name                                                           AS assetName,
                CASE WHEN t.buyer_id  = :uid  THEN 'buy'  ELSE 'sell' END       AS type,
                CASE WHEN t.buyer_id  = :uid2 THEN seller.username
                                              ELSE buyer.username  END           AS counterparty
            FROM transactions t
            JOIN assets a       ON a.id      = t.asset_id
            JOIN users  buyer   ON buyer.id  = t.buyer_id
            JOIN users  seller  ON seller.id = t.seller_id
            WHERE t.buyer_id = :uid3 OR t.seller_id = :uid4
            ORDER BY t.completed_at DESC
            LIMIT 20
        ");
        $stmt->execute([
            ':uid'  => $userId,
            ':uid2' => $userId,
            ':uid3' => $userId,
            ':uid4' => $userId,
        ]);
        $rows = $stmt->fetchAll(\PDO::FETCH_ASSOC);

        $activities = array_map(fn($r) => [
            'id'           => 'act-' . $r['id'],
            'type'         => $r['type'],
            'assetName'    => $r['assetName'],
            'amount'       => (float) $r['amount'],
            'counterparty' => $r['counterparty'],
            'createdAt'    => $r['createdAt'],
        ], $rows);

        return $this->json($response, ['activities' => $activities]);
    }

    /**
     * GET /api/v1/dashboard/portfolio-history?range=1W|1M|3M
     *
     * Returns total portfolio value per day =
     *   wallet balance at end of that day + current asset value.
     *
     * FIX: asset value subquery now scoped to THIS user's inventory only,
     * identical to the query in PageController so chart and stat card always
     * show consistent numbers.
     */
    public function portfolioHistory(Request $request, Response $response): Response
    {
        $user     = $this->auth->getCurrentUser();
        $userId   = (int) $user['id'];
        $range    = $request->getQueryParams()['range'] ?? '1M';

        $interval = match($range) {
            '1W'    => '7 DAY',
            '3M'    => '90 DAY',
            default => '30 DAY',
        };

        // Step 1: wallet balance per day (highest balance_after that day)
        $stmt = $this->db->prepare("
            SELECT
                DATE(created_at)   AS label,
                MAX(balance_after) AS wallet_balance
            FROM wallet_ledger
            WHERE user_id   = :uid
              AND created_at >= DATE_SUB(NOW(), INTERVAL {$interval})
            GROUP BY DATE(created_at)
            ORDER BY DATE(created_at) ASC
        ");
        $stmt->execute([':uid' => $userId]);
        $ledgerRows = $stmt->fetchAll(\PDO::FETCH_ASSOC);

        // Step 2: current asset value for THIS user's inventory only
        // Uses same logic as PageController stat card:
        //   1. Lowest active listing price for the asset
        //   2. Last transaction price as fallback
        //   3. 0 if neither exists
        $assetStmt = $this->db->prepare("
            SELECT COALESCE(SUM(
                COALESCE(
                    (
                        SELECT MIN(l.price)
                        FROM listings l
                        WHERE l.asset_id = a.id
                          AND l.status   = 'active'
                    ),
                    (
                        SELECT t.price
                        FROM transactions t
                        WHERE t.asset_id = a.id
                        ORDER BY t.completed_at DESC
                        LIMIT 1
                    ),
                    0
                )
            ), 0) AS asset_total
            FROM inventory i
            JOIN assets a ON a.id = i.asset_id
            WHERE i.user_id = :uid
        ");
        $assetStmt->execute([':uid' => $userId]);
        $assetValue = (float) $assetStmt->fetchColumn();

        // Step 3: each chart point = wallet balance that day + asset value
        // This gives true net worth at each point in time
        $labels = [];
        $values = [];
        foreach ($ledgerRows as $row) {
            $labels[] = $row['label'];
            $values[] = round((float) $row['wallet_balance'] + $assetValue, 2);
        }

        // If no ledger entries in range, return a single point for today
        if (empty($labels)) {
            $currentBalance = $this->wallet->getBalance($userId);
            $labels[] = date('Y-m-d');
            $values[] = round($currentBalance + $assetValue, 2);
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
            SELECT u.id, u.username, u.verified, u.registered_at,
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

        $stmt = $this->db->prepare("
            SELECT
                COUNT(CASE WHEN seller_id = :uid  THEN 1 END)               AS totalSales,
                COALESCE(SUM(CASE WHEN seller_id = :uid2 THEN price END), 0) AS totalVolume,
                (SELECT COUNT(*) FROM inventory WHERE user_id = :uid3)       AS itemsOwned
            FROM transactions
            WHERE buyer_id = :uid4 OR seller_id = :uid5
        ");
        $stmt->execute([
            ':uid'  => $userId,
            ':uid2' => $userId,
            ':uid3' => $userId,
            ':uid4' => $userId,
            ':uid5' => $userId,
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
            return $this->json($response, [
                'success' => false,
                'message' => 'You can only edit your own profile.',
            ], 403);
        }

        $data        = $request->getParsedBody() ?? [];
        $displayName = trim($data['displayName'] ?? '');
        $bio         = trim($data['bio']         ?? '');

        if (strlen($displayName) > 30) {
            return $this->json($response, [
                'success' => false,
                'message' => 'Display name must be 30 characters or fewer.',
            ], 422);
        }

        if (strlen($bio) > 150) {
            return $this->json($response, [
                'success' => false,
                'message' => 'Bio must be 150 characters or fewer.',
            ], 422);
        }

        $stmt = $this->db->prepare("
            UPDATE users
            SET username = :username,
                bio      = :bio
            WHERE id = :id
        ");
        $stmt->execute([
            ':username' => $displayName ?: $currentUser['username'],
            ':bio'      => $bio ?: null,
            ':id'       => $userId,
        ]);

        return $this->json($response, [
            'success' => true,
            'message' => 'Profile updated successfully.',
        ]);
    }

    private function json(Response $response, array $data, int $status = 200): Response
    {
        $response->getBody()->write(json_encode($data, JSON_UNESCAPED_UNICODE));
        return $response
            ->withHeader('Content-Type', 'application/json')
            ->withStatus($status);
    }
}