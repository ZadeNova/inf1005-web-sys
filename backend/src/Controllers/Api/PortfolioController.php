<?php
// backend/src/Controllers/Api/PortfolioController.php

/**
 * Handles the logged-in user's personal data endpoints.
 * All routes require AuthMiddleware — wired in api.php.
 *
 * Endpoints:
 *   GET /api/v1/user/portfolio     -> inventory with asset details + market values
 *   GET /api/v1/user/transactions  -> buy/sell history
 *   GET /api/v1/user/wallet        -> balance + recent ledger entries
 */

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
     *
     * Returns the user's inventory, enriched with asset details and the
     * current lowest active listing price for that asset (market value).
     *
     * The "market value" join is a correlated subquery — for each inventory
     * row, it finds the cheapest active listing for that asset from any seller.
     * This is what lets the dashboard show "Current Value: $45.00" next to
     * an item you own.
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
                (
                    SELECT MIN(l.price)
                    FROM listings l
                    WHERE l.asset_id = a.id
                      AND l.status   = 'active'
                      AND l.seller_id != :userIdSub
                ) AS market_value
            FROM inventory i
            JOIN assets a ON a.id = i.asset_id
            WHERE i.user_id = :userId
            ORDER BY i.acquired_at DESC
        ");

        // :userId and :userIdSub are the same value but PDO requires
        // unique placeholder names — you can't bind one name used twice
        $stmt->execute([':userId' => $userId, ':userIdSub' => $userId]);
        $items = $stmt->fetchAll(\PDO::FETCH_ASSOC);

        return $this->json($response, [
            'success'   => true,
            'portfolio' => $items,
            'count'     => count($items),
        ]);
    }

    /**
     * GET /api/v1/user/transactions
     *
     * Returns all completed trades where this user was the buyer OR seller.
     * We use a UNION-style approach via OR in the WHERE clause and add a
     * computed `role` column so the frontend knows which side of the trade
     * the user was on — important for colouring buy vs sell in the UI.
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
                    WHEN t.buyer_id  = :userIdCase THEN 'buy'
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
     *
     * Returns current balance and the last 20 ledger entries.
     * The ledger entries let the dashboard show a running history:
     * "Bought Ember Blade — -$120.00 | Balance: $380.00"
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
 * Returns recent buy/sell activity for the logged-in user.
 * Shapes data to match ActivityFeed.jsx expectations.
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
        'type'         => $r['type'],         // 'buy' | 'sell'
        'assetName'    => $r['assetName'],
        'amount'       => (float) $r['amount'],
        'counterparty' => $r['counterparty'],
        'createdAt'    => $r['createdAt'],
    ], $rows);

    return $this->json($response, ['activities' => $activities]);
}

/**
 * GET /api/v1/dashboard/portfolio-history?range=1W|1M|3M
 * Derives portfolio value over time from wallet_ledger running balances.
 * Returns { labels: string[], values: number[] } for PortfolioChart.jsx
 */
public function portfolioHistory(Request $request, Response $response): Response
{
    $user     = $this->auth->getCurrentUser();
    $userId   = (int) $user['id'];
    $range    = $request->getQueryParams()['range'] ?? '1M';

    $interval = match($range) {
        '1W'    => '7 DAY',
        '3M'    => '90 DAY',
        default => '30 DAY',   // 1M
    };

    $stmt = $this->db->prepare("
        SELECT
            DATE(created_at)   AS label,
            MAX(balance_after) AS value
        FROM wallet_ledger
        WHERE user_id   = :uid
          AND created_at >= DATE_SUB(NOW(), INTERVAL {$interval})
        GROUP BY DATE(created_at)
        ORDER BY DATE(created_at) ASC
    ");
    $stmt->execute([':uid' => $userId]);
    $rows = $stmt->fetchAll(\PDO::FETCH_ASSOC);

    return $this->json($response, [
        'labels' => array_column($rows, 'label'),
        'values' => array_map(fn($r) => (float) $r['value'], $rows),
    ]);
}

/**
 * GET /api/v1/users/{userId}/profile
 * Public — returns profile, stats, and wallet for a given user.
 * ProfileCard.jsx passes userId from data-props.
 */
public function profile(Request $request, Response $response, array $args): Response
{
    $userId = (int) ($args['userId'] ?? 0);

    if ($userId <= 0) {
        return $this->json($response, ['success' => false, 'message' => 'Invalid user ID.'], 422);
    }

    $stmt = $this->db->prepare("
        SELECT u.id, u.username, u.verified, u.registered_at,
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

    // Aggregate trade stats in one query
    $stmt = $this->db->prepare("
        SELECT
            COUNT(CASE WHEN seller_id = :uid  THEN 1 END)           AS totalSales,
            COALESCE(SUM(CASE WHEN seller_id = :uid2 THEN price END), 0)
                                                                     AS totalVolume,
            (SELECT COUNT(*) FROM inventory WHERE user_id = :uid3)   AS itemsOwned
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
            'id'         => (int)    $user['id'],
            'username'   => $user['username'],
            'isVerified' => (bool)   $user['verified'],
            'bio'        => null,
            'joinedAt'   => $user['registered_at'],
        ],
        'stats' => [
            'totalSales'  => (int)   $stats['totalSales'],
            'totalVolume' => '$' . number_format((float) $stats['totalVolume'], 2),
            'itemsOwned'  => (int)   $stats['itemsOwned'],
            'joinedAt'    => $user['registered_at'],
        ],
        'wallet' => [
            'balance'  => (float) $user['balance'],
            'currency' => 'VPR',
        ],
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