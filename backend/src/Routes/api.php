<?php

declare(strict_types=1);

use Slim\App;
use App\Controllers\Api\AuthController;

return function (App $app) {

    $app->group('/api/v1', function ($group) {

        // Auth Endpoints
        $group->post('/auth/request-otp', [AuthController::class, 'requestOtp']);
        $group->post('/auth/verify-otp', [AuthController::class, 'verifyOtp']);
        $group->post('/auth/logout', [AuthController::class, 'logout']);

        // Market Endpoints (add controllers as you build them)
        // $group->get('/market/listings', [MarketController::class, 'index']);
        // $group->get('/market/{assetId}/price-history', [MarketController::class, 'priceHistory']);

        // Portfolio Endpoints
        // $group->get('/user/portfolio', [PortfolioController::class, 'index']);

        // Blog Endpoints
        // $group->get('/blog', [BlogController::class, 'index']);
        // $group->post('/blog', [BlogController::class, 'store']);
        // $group->put('/blog/{id}', [BlogController::class, 'update']);
        // $group->delete('/blog/{id}', [BlogController::class, 'destroy']);

    });
};