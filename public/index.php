<?php

session_start();

// Generate CSRF token if one doesn't exist
if (empty($_SESSION['csrf_token'])) {
    $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
}

use Slim\Factory\AppFactory;
use DI\ContainerBuilder;

require __DIR__ . '/../backend/vendor/autoload.php';

// ─── DI Container ───────────────────────────────────────────────────────────
$builder = new ContainerBuilder();

$builder->addDefinitions([

    // ── Database connection (singleton — one PDO for the whole request) ──
    PDO::class => function () {
        $dsn = sprintf('mysql:host=%s;dbname=%s;charset=utf8mb4',
            $_ENV['DB_HOST'] ?? getenv('DB_HOST'),
            $_ENV['DB_NAME'] ?? getenv('DB_NAME')
        );
        return new PDO(
            $dsn,
            $_ENV['DB_USER'] ?? getenv('DB_USER'),
            $_ENV['DB_PASS'] ?? getenv('DB_PASS'),
            [
                PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES   => false,
            ]
        );
    },

    // ── Auth ─────────────────────────────────────────────────────────────
    App\Services\AuthService::class => function ($c) {
        return new App\Services\AuthService(
            $c->get(PDO::class)
        );
    },

    // ── Middleware ────────────────────────────────────────────────────────
    App\Middleware\AuthMiddleware::class => function ($c) {
        return new App\Middleware\AuthMiddleware(
            $c->get(App\Services\AuthService::class)
        );
    },

    App\Middleware\AdminMiddleware::class => function ($c) {
        return new App\Middleware\AdminMiddleware(
            $c->get(App\Services\AuthService::class)
        );
    },

    // ── Repositories ─────────────────────────────────────────────────────
    App\Repositories\ListingRepository::class => function ($c) {
        return new App\Repositories\ListingRepository(
            $c->get(PDO::class)
        );
    },

    // ── Services ─────────────────────────────────────────────────────────
    App\Services\WalletService::class => function ($c) {
        return new App\Services\WalletService(
            $c->get(PDO::class)
        );
    },

    App\Services\MarketService::class => function ($c) {
        return new App\Services\MarketService(
            $c->get(PDO::class),
            $c->get(App\Repositories\ListingRepository::class),
            $c->get(App\Services\WalletService::class)
        );
    },

    // ── Controllers ──────────────────────────────────────────────────────
    App\Controllers\Api\MarketController::class => function ($c) {
        return new App\Controllers\Api\MarketController(
            $c->get(App\Services\MarketService::class),
            $c->get(App\Services\AuthService::class)
        );
    },

    App\Controllers\Api\PortfolioController::class => function ($c) {
        return new App\Controllers\Api\PortfolioController(
            $c->get(PDO::class),
            $c->get(App\Services\AuthService::class),
            $c->get(App\Services\WalletService::class)
        );
    },

]);

$container = $builder->build();
AppFactory::setContainer($container);
// ─────────────────────────────────────────────────────────────────────────────

$app = AppFactory::create();

$app->addRoutingMiddleware();
$app->addBodyParsingMiddleware();
$app->addErrorMiddleware(true, true, true);

(require __DIR__ . '/../backend/src/Routes/web.php')($app);
(require __DIR__ . '/../backend/src/Routes/api.php')($app);

$app->run();