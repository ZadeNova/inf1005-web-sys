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
    private MarketService $market;
    private AuthService   $auth;

    public function __construct(MarketService $market, AuthService $auth)
    {
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
        // getQueryParams() reads everything after the ? in the URL
        $params   = $request->getQueryParams();
        $listings = $this->market->getListings($params);

        return $this->json($response, [
            'success'  => true,
            'listings' => $listings,
            'count'    => count($listings),
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

    // Same helper as AuthController — every API controller has this
    private function json(Response $response, array $data, int $status = 200): Response
    {
        $response->getBody()->write(json_encode($data, JSON_UNESCAPED_UNICODE));
        return $response
            ->withHeader('Content-Type', 'application/json')
            ->withStatus($status);
    }
}