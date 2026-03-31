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
    // ── Live stats ────────────────────────────────────────────────────
    $totalVolume = (float) $this->db
        ->query("SELECT COALESCE(SUM(price), 0) FROM transactions")
        ->fetchColumn();

    $activeListings = (int) $this->db
        ->query("SELECT COUNT(*) FROM listings WHERE status = 'active'")
        ->fetchColumn();

    $totalUsers = (int) $this->db
        ->query("SELECT COUNT(*) FROM users")
        ->fetchColumn();

    $floorPrice = (float) $this->db
        ->query("SELECT COALESCE(MIN(price), 0) FROM listings WHERE status = 'active'")
        ->fetchColumn();

    $stmt = $this->db->query("
        SELECT 
            COALESCE(SUM(CASE WHEN completed_at >= DATE_SUB(NOW(), INTERVAL 7 DAY) THEN price ELSE 0 END), 0) AS vol_7d,
            COALESCE(SUM(CASE WHEN completed_at >= DATE_SUB(NOW(), INTERVAL 14 DAY) 
                            AND completed_at <  DATE_SUB(NOW(), INTERVAL 7 DAY)  THEN price ELSE 0 END), 0) AS vol_prev_7d
        FROM transactions
    ");
    $row       = $stmt->fetch(\PDO::FETCH_ASSOC);
    $vol7d     = (float) $row['vol_7d'];
    $volPrev7d = (float) $row['vol_prev_7d'];

    $change7d = match(true) {
        $volPrev7d > 0 => sprintf('%+.1f%%', (($vol7d - $volPrev7d) / $volPrev7d) * 100),
        $vol7d > 0     => '+100.0%',
        default        => '0.0%',
    };

    $stats = [
        ['label' => 'Total Volume',     'value' => '$' . number_format($totalVolume, 2),   'sub' => 'All time'],
        ['label' => 'Active Listings',  'value' => number_format($activeListings),          'sub' => 'Right now'],
        ['label' => 'Registered Users', 'value' => number_format($totalUsers),              'sub' => 'And growing'],
        ['label' => 'Floor Price',      'value' => '$' . number_format($floorPrice, 2),     'sub' => 'Lowest listing'],
        ['label' => '7-Day Change', 'value' => $change7d, 'sub' => 'Market trend', 'positive' => $vol7d >= $volPrev7d],
    ];

    // ── Featured listings (3 most recent active) ──────────────────────
    // In PageController::home(), change the featured listings query:
$stmt = $this->db->query("
    SELECT l.id, l.price,
           a.name, a.rarity, a.condition_state, a.collection,
           a.image_url,
           u.username AS seller_username
    FROM listings l
    JOIN assets a ON a.id = l.asset_id
    JOIN users  u ON u.id = l.seller_id
    WHERE l.status = 'active'
    ORDER BY l.created_at DESC
    LIMIT 3
");
    $rows = $stmt->fetchAll(\PDO::FETCH_ASSOC);

    // Rarity metadata map — mirrors frontend RARITY constants
    $rarityMeta = [
        'COMMON'      => ['label' => 'Common',      'symbol' => '●', 'css_key' => 'common'],
        'UNCOMMON'    => ['label' => 'Uncommon',     'symbol' => '◆', 'css_key' => 'uncommon'],
        'RARE'        => ['label' => 'Rare',         'symbol' => '★', 'css_key' => 'rare'],
        'ULTRA_RARE'  => ['label' => 'Ultra Rare',   'symbol' => '✦', 'css_key' => 'ultrarare'],
        'SECRET_RARE' => ['label' => 'Secret Rare',  'symbol' => '♛', 'css_key' => 'secretrare'],
    ];

    $featured = array_map(function ($row) use ($rarityMeta) {
    $meta = $rarityMeta[$row['rarity']] ?? $rarityMeta['COMMON'];
    return [
        'id'             => (string) $row['id'],
        'name'           => $row['name'],
        'collection'     => $row['collection'] ?? '',
        'rarity_label'   => $meta['label'],
        'rarity_symbol'  => $meta['symbol'],
        'rarity_css_key' => $meta['css_key'],
        'condition'      => $row['condition_state'],
        'price'          => '$' . number_format((float) $row['price'], 2),
        'seller'         => $row['seller_username'],
        'image_url'      => $row['image_url'] ?? null,  // ← add this
    ];
    }, $rows);

    return $this->render($response, 'home', [
        'title'    => 'Vapour FT — Digital Asset Marketplace',
        'stats'    => $stats,
        'featured' => $featured,
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

    public function listing(Request $request, Response $response, array $args): Response
    {
    $listingId = (int) ($args['id'] ?? 0);

    if ($listingId <= 0) {
        return $response->withStatus(404);
    }

    return $this->render($response, 'listing', [
        'title'     => 'Listing — Vapour FT',
        'listingId' => $listingId,
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


    public function blogPost(Request $request, Response $response, array $args): Response
    {
        $id   = (int)($args['id'] ?? 0);
        $stmt = $this->db->prepare("
            SELECT bp.id, bp.title, bp.body, bp.category, bp.created_at,
                u.username AS author
            FROM blog_posts bp
            JOIN users u ON u.id = bp.author_id
            WHERE bp.id = :id
        ");
        $stmt->execute([':id' => $id]);
        $post = $stmt->fetch(\PDO::FETCH_ASSOC);

        if (!$post) {
            return $response->withStatus(404);
        }

        return $this->render($response, 'blog-post', ['post' => $post]);
    }
}