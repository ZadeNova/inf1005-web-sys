<?php

declare(strict_types=1);

namespace App\Controllers;

use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;
use App\Services\WalletService;

class PageController
{
    private WalletService $wallet;
    private \PDO          $db;

    public function __construct(WalletService $wallet, \PDO $db)
    {
        $this->wallet = $wallet;
        $this->db     = $db;
    }

    /**
     * Asset market value — identical priority logic to PortfolioController::calcAssetValue().
     *
     * Priority:
     *   1. Last transaction price  (most recent sale on the platform)
     *   2. Other sellers' floor   (lowest active listing, own listings excluded)
     *   3. Zero
     *
     * Keeping this in sync with PortfolioController ensures the PHP stat card
     * and the React chart always display the same number.
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

    private function render(Response $response, string $view, array $data = []): Response
    {
        extract($data);
        ob_start();
        require __DIR__ . '/../Views/' . $view . '.php';
        $content = ob_get_clean();
        $response->getBody()->write($content);
        return $response;
    }

    public function home(Request $request, Response $response): Response
    {
        return $this->render($response, 'home', [
            'title' => 'Vapour FT — Digital Asset Marketplace',
        ]);
    }

    public function about(Request $request, Response $response): Response
    {
        return $this->render($response, 'about', [
            'title' => 'About Us — Vapour FT',
        ]);
    }

    public function login(Request $request, Response $response): Response
    {
        return $this->render($response, 'login', [
            'title' => 'Login — Vapour FT',
        ]);
    }

    public function register(Request $request, Response $response): Response
    {
        return $this->render($response, 'register', [
            'title' => 'Register — Vapour FT',
        ]);
    }

    public function listings(Request $request, Response $response): Response
    {
        return $this->render($response, 'listings', [
            'title' => 'Market Listings — Vapour FT',
        ]);
    }

    public function blog(Request $request, Response $response): Response
    {
        return $this->render($response, 'blog', [
            'title' => 'Market News — Vapour FT',
        ]);
    }

    public function dashboard(Request $request, Response $response): Response
    {
        $userId = isset($_SESSION['user_id']) ? (int) $_SESSION['user_id'] : null;

        $walletBalance  = $userId ? $this->wallet->getBalance($userId) : 0.00;
        $assetValue     = $userId ? $this->calcAssetValue($userId)     : 0.00;
        $portfolioValue = $walletBalance + $assetValue;

        return $this->render($response, 'dashboard', [
            'title'     => 'Dashboard — Vapour FT',
            'dashStats' => [
                'username'       => $_SESSION['username'] ?? 'Trader',
                'isVerified'     => false,
                'portfolioValue' => $portfolioValue,
                'walletBalance'  => $walletBalance,
                'currency'       => 'VPR',
            ],
        ]);
    }

    public function profile(Request $request, Response $response): Response
    {
        return $this->render($response, 'profile', [
            'title' => 'My Profile — Vapour FT',
        ]);
    }

    public function admin(Request $request, Response $response): Response
    {
        return $this->render($response, 'admin', [
            'title' => 'Admin Panel — Vapour FT',
        ]);
    }
}