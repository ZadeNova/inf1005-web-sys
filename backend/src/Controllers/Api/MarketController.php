<?php
// backend/src/Controllers/Api/MarketController.php

/**
 * Handles marketplace API endpoints.
 * All write endpoints (buy, sell, cancel) require AuthMiddleware.
 *
 * Endpoints:
 *   GET    /api/v1/market/listings        -> browse active listings
 *   POST   /api/v1/market/buy             -> purchase a listing
 *   POST   /api/v1/market/listings        -> create a sell listing
 *   DELETE /api/v1/market/listings/{id}   -> cancel own listing
 */

namespace App\Controllers\Api;

use App\Services\AuthService;
use App\Services\MarketService;
use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;

class MarketController
{
    private \PDO          $db;
    private MarketService $market;
    private AuthService   $auth;

    public function __construct(\PDO $db, MarketService $market, AuthService $auth)
    {
        $this->db     = $db;
        $this->market = $market;
        $this->auth   = $auth;
    }

    /**
     * GET /api/v1/market/listings
     *
     * Public endpoint — no auth required.
     * Accepts query params: ?search= &rarity= &condition= &sort= &page=
     *
     * Query params come from the URL, not the body.
     * e.g. /api/v1/market/listings?rarity=Legendary&sort=price_asc
     */
    public function index(Request $request, Response $response): Response
    {
        $params = $request->getQueryParams();
        $result = $this->market->getListings($params);

        return $this->json($response, [
            'success'  => true,
            'listings' => $result['listings'],
            'count'    => count($result['listings']),
            'total'    => $result['total'],
            'page'     => $result['page'],
            'perPage'  => $result['perPage'],
            'pages'    => (int) ceil($result['total'] / $result['perPage']),
        ]);
    }

    /**
     * POST /api/v1/market/buy
     * Body: { "listingId": 5 }
     *
     * Protected — requires login.
     * The buyer's identity comes from the session, never from the request body.
     * If we trusted the client to send their own userId, anyone could spoof purchases.
     */
    public function buy(Request $request, Response $response): Response
    {
        $data      = $request->getParsedBody() ?? [];
        $listingId = isset($data['listingId']) ? (int) $data['listingId'] : 0;

        if ($listingId <= 0) {
            return $this->json($response, [
                'success' => false,
                'message' => 'A valid listingId is required.',
            ], 422);
        }

        // getCurrentUser() reads from the session — this is the source of truth for who's buying
        $user   = $this->auth->getCurrentUser();
        $result = $this->market->executePurchase((int) $user['id'], $listingId);

        $status = $result['success'] ? 200 : 400;
        return $this->json($response, $result, $status);
    }

    /**
     * POST /api/v1/market/listings
     * Body: { "assetId": 3, "price": 49.99 }
     *
     * Protected — requires login.
     * Creates a sell listing for an asset the user owns.
     */
    public function store(Request $request, Response $response): Response
    {
        $data    = $request->getParsedBody() ?? [];
        $assetId = isset($data['assetId']) ? (int) $data['assetId'] : 0;
        $price   = isset($data['price'])   ? (float) $data['price'] : 0.0;

        $errors = [];

        if ($assetId <= 0) {
            $errors['assetId'] = 'A valid assetId is required.';
        }

        // Price sanity check — must be positive and reasonable
        if ($price <= 0 || $price > 999999.99) {
            $errors['price'] = 'Price must be between $0.01 and $999,999.99.';
        }

        if (!empty($errors)) {
            return $this->json($response, [
                'success' => false,
                'message' => 'Invalid listing data.',
                'errors'  => $errors,
            ], 422);
        }

        $user   = $this->auth->getCurrentUser();
        $result = $this->market->createListing((int) $user['id'], $assetId, $price);

        $status = $result['success'] ? 201 : 400;
        return $this->json($response, $result, $status);
    }

    /**
     * DELETE /api/v1/market/listings/{id}
     *
     * Protected — requires login.
     * {id} is a route parameter, pulled from $args — not the body.
     * Slim injects route params as the third argument to any route handler.
     */
    public function cancel(Request $request, Response $response, array $args): Response
    {
        $listingId = isset($args['id']) ? (int) $args['id'] : 0;

        if ($listingId <= 0) {
            return $this->json($response, [
                'success' => false,
                'message' => 'Invalid listing ID.',
            ], 422);
        }

        $user   = $this->auth->getCurrentUser();
        $result = $this->market->cancelListing((int) $user['id'], $listingId);

        $status = $result['success'] ? 200 : 400;
        return $this->json($response, $result, $status);
    }

    /**
     * GET /api/v1/market/listings/mine
     * Protected — returns the logged-in user's active listings only.
     * Shapes response to match ActiveListingsManager.jsx mock structure.
     */
    public function mine(Request $request, Response $response): Response
    {
        $user   = $this->auth->getCurrentUser();
        $userId = (int) $user['id'];

        $stmt = $this->db->prepare("
            SELECT l.id, l.price, l.status, l.created_at,
                a.id AS asset_id, a.name AS asset_name, a.rarity, a.condition_state,
                a.image_url
            FROM listings l
            JOIN assets a ON a.id = l.asset_id
            WHERE l.seller_id = :uid AND l.status = 'active'
            ORDER BY l.created_at DESC
        ");
        $stmt->execute([':uid' => $userId]);
        $rows = $stmt->fetchAll(\PDO::FETCH_ASSOC);

        $shaped = array_map(fn($r) => [
            'id'        => (string) $r['id'],
            'listedAt'  => $r['created_at'],
            'image_url' => $r['image_url'] ?? null,   // ← add this
            'asset'     => [
                'id'     => (string) $r['asset_id'],
                'name'   => $r['asset_name'],
                'rarity' => $r['rarity'],
                'price'  => (float)  $r['price'],
            ],
        ], $rows);

        $salesStmt = $this->db->prepare(
            "SELECT COUNT(*) FROM transactions WHERE seller_id = :uid"
        );
        $salesStmt->execute([':uid' => $userId]);

        $ownedStmt = $this->db->prepare(
            "SELECT COUNT(*) FROM inventory WHERE user_id = :uid"
        );
        $ownedStmt->execute([':uid' => $userId]);

        return $this->json($response, [
            'listings' => $shaped,
            'stats'    => [
                'totalSales' => (int) $salesStmt->fetchColumn(),
                'itemsOwned' => (int) $ownedStmt->fetchColumn(),
            ],
        ]);
    }

    /**
     * GET /api/v1/market/price-history?range=1W|1M|3M|6M|1Y
     * Public — floor price per collection per day from transactions table.
     * Returns Chart.js-ready { labels, datasets } for PriceChart.jsx
     */
    public function priceHistory(Request $request, Response $response): Response
    {
        $range    = $request->getQueryParams()['range'] ?? '1M';
        $interval = match($range) {
            '1W'    => '7 DAY',
            '3M'    => '90 DAY',
            '6M'    => '180 DAY',
            '1Y'    => '365 DAY',
            default => '30 DAY',
        };

        $stmt = $this->db->query("
            SELECT
                a.collection         AS col,
                DATE(t.completed_at) AS label,
                MIN(t.price)         AS floor
            FROM transactions t
            JOIN assets a ON a.id = t.asset_id
            WHERE t.completed_at >= DATE_SUB(NOW(), INTERVAL {$interval})
            GROUP BY a.collection, DATE(t.completed_at)
            ORDER BY DATE(t.completed_at) ASC
        ");
        $rows = $stmt->fetchAll(\PDO::FETCH_ASSOC);

        $byCollection = [];
        $allDates     = [];
        foreach ($rows as $row) {
            $byCollection[$row['col']][$row['label']] = (float) $row['floor'];
            $allDates[$row['label']] = true;
        }

        $labels   = array_keys($allDates);
        $datasets = [];
        foreach ($byCollection as $collection => $dateMap) {
            $datasets[] = [
                'label' => $collection,
                'data'  => array_map(fn($d) => $dateMap[$d] ?? null, $labels),
            ];
        }

        if (empty($labels)) {
            return $this->json($response, ['labels' => [], 'datasets' => []]);
        }

        return $this->json($response, ['labels' => $labels, 'datasets' => $datasets]);
    }


    /**
     * GET /api/v1/market/listings/{id}
     * Public. Returns full listing detail for the listing detail page.
     */
    public function getListing(Request $request, Response $response, array $args): Response
    {
        $id      = isset($args['id']) ? (int) $args['id'] : 0;
        $listing = $this->market->findListingById($id);

        if (!$listing) {
            return $this->json($response, ['error' => 'Listing not found.'], 404);
        }

        return $this->json($response, $listing);
    }

    /**
     * GET /api/v1/market/listings/{id}/price-history
     * Public. Returns per-asset transaction history for PriceChart.
     */
    public function getAssetPriceHistory(Request $request, Response $response, array $args): Response
    {
        $listingId = isset($args['id']) ? (int) $args['id'] : 0;

        // Resolve asset_id from listing_id so the frontend only needs listing context
        $listing = $this->market->findListingById($listingId);
        if (!$listing) {
            return $this->json($response, ['error' => 'Listing not found.'], 404);
        }

        $history = $this->market->getAssetPriceHistory($listing['asset']['id']);
        return $this->json($response, ['history' => $history]);
    }

    // Same helper as AuthController — every API controller has this
    private function json(Response $response, array $data, int $status = 200): Response
    {
        $response->getBody()->write(json_encode($data, JSON_UNESCAPED_UNICODE));
        return $response
            ->withHeader('Content-Type', 'application/json')
            ->withStatus($status);
    }
}