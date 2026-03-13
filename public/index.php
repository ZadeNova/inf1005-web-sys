<?php

session_start();

use Slim\Factory\AppFactory;
use DI\Container;

require __DIR__ . '/../backend/vendor/autoload.php';

$container = new Container();
AppFactory::setContainer($container);

$app = AppFactory::create();

$app->addRoutingMiddleware();
$app->addBodyParsingMiddleware();
$app->addErrorMiddleware(true, true, true);

(require __DIR__ . '/../backend/src/Routes/web.php')($app);
(require __DIR__ . '/../backend/src/Routes/api.php')($app);

$app->run();