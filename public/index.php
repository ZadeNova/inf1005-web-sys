<?php

session_start();

use Slim\Factory\AppFactory;
use DI\ContainerBuilder;
use Delight\Auth\Auth;

require __DIR__ . '/../backend/vendor/autoload.php';

// ─── DI Container ───────────────────────────────────────────────────────────
$builder = new ContainerBuilder();

$builder->addDefinitions([

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

    Auth::class => function (\Psr\Container\ContainerInterface $c) {
        return new Auth($c->get(PDO::class));
    },

]);

$container = $builder->build();
AppFactory::setContainer($container);
// ────────────────────────────────────────────────────────────────────────────

$app = AppFactory::create();

$app->addRoutingMiddleware();
$app->addBodyParsingMiddleware();
$app->addErrorMiddleware(true, true, true);

(require __DIR__ . '/../backend/src/Routes/web.php')($app);
(require __DIR__ . '/../backend/src/Routes/api.php')($app);

$app->run();