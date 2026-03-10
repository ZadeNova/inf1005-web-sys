<?php

use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;
use Slim\Factory\AppFactory;

require __DIR__ . '/../backend/vendor/autoload.php';

$app = AppFactory::create();

// Add routing middleware
$app->addRoutingMiddleware();

// Add error middleware
$app->addErrorMiddleware(true, true, true);

// Test route
$app->get('/api/hello', function (Request $request, Response $response) {
    $data = ['message' => 'Slim Framework is working!'];
    $response->getBody()->write(json_encode($data));
    return $response->withHeader('Content-Type', 'application/json');
});


(require __DIR__ . '/../backend/src/Routes/web.php')($app);
(require __DIR__ . '/../backend/src/Routes/api.php')($app);

session_start();


$app->run();