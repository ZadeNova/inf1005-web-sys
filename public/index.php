<?php
//Session Hardening
ini_set('session.cookie_httponly', '1');   // Blocks JS from reading the cookie
ini_set('session.cookie_samesite', 'Lax'); // Prevents CSRF via cross-site requests

$appEnv = $_ENV['APP_ENV'] ?? getenv('APP_ENV') ?? 'development';
if ($appEnv === 'production') {
    ini_set('session.cookie_secure', '1'); // HTTPS-only cookie in production
}

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

    // ── Database connection (singleton) ──────────────────────────────────
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
    
    //── Security Headers ────────────────────────────────────────────────────
    App\Middleware\SecurityHeadersMiddleware::class => function () {
    return new App\Middleware\SecurityHeadersMiddleware();
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
            $c->get(PDO::class),
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

    App\Controllers\Api\BlogController::class => function ($c) {
        return new App\Controllers\Api\BlogController(
            $c->get(PDO::class)
        );
    },

    App\Controllers\Api\AdminController::class => function ($c) {
        return new App\Controllers\Api\AdminController(
            $c->get(PDO::class)
        );
    },

    // FIX: PageController now receives PDO for portfolio value calculation
    App\Controllers\PageController::class => function ($c) {
        return new App\Controllers\PageController(
            $c->get(App\Services\WalletService::class),
            $c->get(PDO::class)
        );
    },

]);

$container = $builder->build();
AppFactory::setContainer($container);
// ─────────────────────────────────────────────────────────────────────────────

$app = AppFactory::create();

// Security headers run on EVERY response — register first
$app->add($container->get(App\Middleware\SecurityHeadersMiddleware::class));

$app->addRoutingMiddleware();
$app->addBodyParsingMiddleware();

//hide error details in production but show in development
$isProduction = ($appEnv === 'production');
$app->addErrorMiddleware(!$isProduction, true, true);

//Custom 404 handler to return JSON for API routes and redirect for others
$errorMiddleware->setErrorHandler(
    \Slim\Exception\HttpNotFoundException::class,
    function ($request, $exception) use ($app) {
        $response = $app->getResponseFactory()->createResponse();

        // If it's an API route, return JSON 404
        $path = $request->getUri()->getPath();
        if (str_starts_with($path, '/api/')) {
            $response->getBody()->write(json_encode([
                'success' => false,
                'message' => 'Endpoint not found.',
            ]));
            return $response
                ->withStatus(404)
                ->withHeader('Content-Type', 'application/json');
        }

        // Otherwise redirect to homepage
        return $response
            ->withHeader('Location', '/')
            ->withStatus(302);
    }
);
(require __DIR__ . '/../backend/src/Routes/web.php')($app);
(require __DIR__ . '/../backend/src/Routes/api.php')($app);

$app->run();