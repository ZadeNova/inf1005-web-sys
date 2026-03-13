<?php

declare(strict_types=1);

use Slim\App;
use App\Controllers\Api\AuthController;

return function (App $app) {

    $app->group('/api/v1', function ($group) {

        // Auth Endpoints
        $group->post('/auth/register', [AuthController::class, 'register']);
        $group->post('/auth/login',    [AuthController::class, 'login']);
        $group->post('/auth/logout',   [AuthController::class, 'logout']);

        // Market Endpoints
        // $group->get('/market/listings',                    [MarketController::class, 'index']);
        // $group->post('/market/buy',                        [MarketController::class, 'buy']);
        // $group->get('/market/price-history/{assetId}',    [MarketController::class, 'priceHistory']);

        // User Endpoints
        // $group->get('/user/portfolio',     [PortfolioController::class, 'index']);
        // $group->get('/user/transactions',  [PortfolioController::class, 'transactions']);

        // Blog Endpoints
        // $group->get('/blog',          [BlogController::class, 'index']);
        // $group->post('/blog',         [BlogController::class, 'store']);
        // $group->put('/blog/{id}',     [BlogController::class, 'update']);
        // $group->delete('/blog/{id}',  [BlogController::class, 'destroy']);

        // Admin Endpoints
        // $group->get('/admin/users',         [AdminController::class, 'users']);
        // $group->get('/admin/transactions',  [AdminController::class, 'transactions']);
        // $group->post('/admin/assets',       [AdminController::class, 'createAsset']);

    });
};