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
            'title' => 'Vapour FT — Digital Asset Marketplace'
        ]);
    }

    public function about(Request $request, Response $response): Response
    {
        return $this->render($response, 'about', [
            'title' => 'About Us — Vapour FT'
        ]);
    }

    public function login(Request $request, Response $response): Response
    {
        return $this->render($response, 'login', [
            'title' => 'Login — Vapour FT'
        ]);
    }

    public function register(Request $request, Response $response): Response
    {
        return $this->render($response, 'register', [
            'title' => 'Register — Vapour FT'
        ]);
    }

    public function listings(Request $request, Response $response): Response
    {
        return $this->render($response, 'listings', [
            'title' => 'Market Listings — Vapour FT'
        ]);
    }

    public function blog(Request $request, Response $response): Response
    {
        return $this->render($response, 'blog', [
            'title' => 'Market News — Vapour FT'
        ]);
    }

    public function dashboard(Request $request, Response $response): Response
    {
        $userId  = $_SESSION['user_id'] ?? null;

        // Wallet cash balance
        $walletBalance = $userId
            ? $this->wallet->getBalance((int) $userId)
            : 0.00;

        // Asset value: for every owned asset, use the best available price:
        //   1. Lowest active listing price on the market for that asset
        //   2. Last transaction price (most recent sale)
        //   3. 0 if neither exists yet
        $assetValue = 0.00;
        if ($userId) {
            $stmt = $this->db->prepare("
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
            $stmt->execute([':uid' => (int) $userId]);
            $assetValue = (float) $stmt->fetchColumn();
        }

        // Total portfolio = wallet cash + estimated asset value
        $portfolioValue = $walletBalance + $assetValue;

        return $this->render($response, 'dashboard', [
            'title'      => 'Dashboard — Vapour FT',
            'dashStats'  => [
                'username'        => $_SESSION['username'] ?? 'Trader',
                'isVerified'      => false,
                'portfolioValue'  => $portfolioValue,
                'portfolioChange' => null,
                'walletBalance'   => $walletBalance,
                'currency'        => 'VPR',
            ],
        ]);
    }

    public function profile(Request $request, Response $response): Response
    {
        return $this->render($response, 'profile', [
            'title' => 'My Profile — Vapour FT'
        ]);
    }

    public function admin(Request $request, Response $response): Response
    {
        return $this->render($response, 'admin', [
            'title' => 'Admin Panel — Vapour FT'
        ]);
    }
}