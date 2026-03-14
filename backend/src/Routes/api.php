<?php

declare(strict_types=1);

use Slim\App;
use App\Controllers\Api\AuthController;
use App\Controllers\Api\MarketController;
use App\Controllers\Api\PortfolioController;
use App\Middleware\AuthMiddleware;
use App\Middleware\CsrfMiddleware;



return function (App $app) {

    $app->group('/api/v1', function ($group) {

        // Auth Endpoints
        $group->post('/auth/register', [AuthController::class, 'register']);
        $group->post('/auth/login',    [AuthController::class, 'login']);
        $group->post('/auth/logout',   [AuthController::class, 'logout']);
        $group->get('/auth/me',        [AuthController::class, 'me']); 


        // Market Controller (GET is public, write endpoints are protected)
        $group->get('/market/listings',           [MarketController::class, 'index']);
        $group->post('/market/buy',               [MarketController::class, 'buy'])
            ->add(AuthMiddleware::class);
        $group->post('/market/listings',          [MarketController::class, 'store'])
            ->add(AuthMiddleware::class);
        $group->delete('/market/listings/{id}',   [MarketController::class, 'cancel'])
            ->add(AuthMiddleware::class);

            
        // ── Portfolio Controlelr ────────────────────────────────────
        $group->get('/user/portfolio',    [PortfolioController::class, 'portfolio'])
            ->add(AuthMiddleware::class);
        $group->get('/user/transactions', [PortfolioController::class, 'transactions'])
            ->add(AuthMiddleware::class);
        $group->get('/user/wallet',       [PortfolioController::class, 'wallet'])
            ->add(AuthMiddleware::class);

        // Blog Endpoints
        // $group->get('/blog',          [BlogController::class, 'index']);
        // $group->post('/blog',         [BlogController::class, 'store']);
        // $group->put('/blog/{id}',     [BlogController::class, 'update']);
        // $group->delete('/blog/{id}',  [BlogController::class, 'destroy']);

        // Admin Endpoints
        // $group->get('/admin/users',         [AdminController::class, 'users']);
        // $group->get('/admin/transactions',  [AdminController::class, 'transactions']);
        // $group->post('/admin/assets',       [AdminController::class, 'createAsset']);

    });  //->add(CsrfMiddleware::class); //Uncomment for Postman Testing as Postman doesn't handle CSRF tokens. Remember to re-enable CsrfMiddleware.
};