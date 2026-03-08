<?php

// use Psr\Http\Message\ResponseInterface as Response;
// use Psr\Http\Message\ServerRequestInterface as Request;
// use Slim\Factory\AppFactory;

// require __DIR__ . '/../vendor/autoload.php';

// $app = AppFactory::create();

// $app->addRoutingMiddleware();
// $app->addErrorMiddleware(true, true, true);

// // Add CORS headers so React can talk to Slim
// $app->add(function ($request, $handler) {
//     $response = $handler->handle($request);
//     return $response
//         ->withHeader('Access-Control-Allow-Origin', 'http://localhost:3000')
//         ->withHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
//         ->withHeader('Access-Control-Allow-Headers', 'Content-Type');
// });

// // Test route
// $app->get('/api/test', function (Request $request, Response $response) {
//     $data = [
//         'status'  => 'success',
//         'message' => 'Slim backend is connected!',
//     ];
//     $response->getBody()->write(json_encode($data));
//     return $response->withHeader('Content-Type', 'application/json');
// });

//$app->run();