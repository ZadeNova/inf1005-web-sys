<?php

declare(strict_types=1);

use Slim\App;
use App\Controllers\Api\AuthController;
use App\Controllers\Api\MarketController;
use App\Controllers\Api\PortfolioController;
use App\Controllers\Api\BlogController;
use App\Controllers\Api\AdminController;
use App\Middleware\AuthMiddleware;
use App\Middleware\AdminMiddleware;
use App\Middleware\CsrfMiddleware;

return function (App $app) {

    $app->group('/api/v1', function ($group) {

        // ── Auth ──────────────────────────────────────────────────────────
        $group->post('/auth/register', [AuthController::class, 'register']);
        $group->post('/auth/login',    [AuthController::class, 'login']);
        $group->post('/auth/logout',   [AuthController::class, 'logout']);
        $group->post('/auth/change-password', [AuthController::class, 'changePassword'])
            ->add(AuthMiddleware::class);
        $group->get('/auth/me',        [AuthController::class, 'me']);

        // ── Market (GET public, writes protected) ─────────────────────────
        $group->get('/market/listings',         [MarketController::class, 'index']);
        $group->get('/market/listings/mine',    [MarketController::class, 'mine'])
            ->add(AuthMiddleware::class);
        $group->post('/market/buy',             [MarketController::class, 'buy'])
            ->add(AuthMiddleware::class);
        $group->post('/market/listings',        [MarketController::class, 'store'])
            ->add(AuthMiddleware::class);
        $group->delete('/market/listings/{id}', [MarketController::class, 'cancel'])
            ->add(AuthMiddleware::class);
        $group->get('/market/listings/{id}',               [MarketController::class, 'getListing']);
        $group->patch('/market/listings/{id}', [MarketController::class, 'updateListing'])
            ->add(AuthMiddleware::class);

        // ── Portfolio (all protected) ─────────────────────────────────────
        $group->get('/user/portfolio',    [PortfolioController::class, 'portfolio'])
            ->add(AuthMiddleware::class);
        $group->get('/user/transactions', [PortfolioController::class, 'transactions'])
            ->add(AuthMiddleware::class);
        $group->get('/user/wallet',       [PortfolioController::class, 'wallet'])
            ->add(AuthMiddleware::class);

        // ── Dashboard (protected) ─────────────────────────────────────────
        $group->get('/dashboard/activity',          [PortfolioController::class, 'activity'])
            ->add(AuthMiddleware::class);
        $group->get('/dashboard/portfolio-history', [PortfolioController::class, 'portfolioHistory'])
            ->add(AuthMiddleware::class);

        // ── User profile (public GET, protected PATCH) ────────────────────
        $group->get('/users/{userId}/profile',   [PortfolioController::class, 'profile']);
        $group->patch('/users/{userId}/profile', [PortfolioController::class, 'updateProfile'])
            ->add(AuthMiddleware::class);

        $group->get('/users/{userId}/bank',   [PortfolioController::class, 'getBank'])
            ->add(AuthMiddleware::class);
        $group->put('/users/{userId}/bank',   [PortfolioController::class, 'upsertBank'])
            ->add(AuthMiddleware::class);
        // api.php
        $group->post('/user/wallet/deposit', [PortfolioController::class, 'deposit'])
            ->add(AuthMiddleware::class);

        // ── Blog (GET public, POST protected) ─────────────────────────────
        $group->get('/blog/posts',  [BlogController::class, 'index']);
        $group->post('/blog/posts', [BlogController::class, 'store'])
            ->add(AuthMiddleware::class);
        $group->get('/blog/posts/{id}',           [BlogController::class, 'show']);
        $group->patch('/admin/blog/posts/{id}',   [AdminController::class, 'editBlogPost'])
            ->add(AdminMiddleware::class);
        $group->delete('/admin/blog/posts/{id}',  [AdminController::class, 'deleteBlogPost'])
            ->add(AdminMiddleware::class);

        // ── Admin (all admin-only) ────────────────────────────────────────
        $group->get('/admin/listings',         [AdminController::class, 'listings'])
            ->add(AdminMiddleware::class);
        $group->post('/admin/news',            [AdminController::class, 'createNews'])
            ->add(AdminMiddleware::class);
        $group->patch('/admin/listings/{id}',  [AdminController::class, 'editListing'])
            ->add(AdminMiddleware::class);
        $group->delete('/admin/listings/{id}', [AdminController::class, 'deleteListing'])
            ->add(CsrfMiddleware::class)
            ->add(AdminMiddleware::class);
        $group->post('/admin/assets', [AdminController::class, 'createAsset'])
            ->add(AdminMiddleware::class);
    }); // <-- important semicolon here

    // $app->add(CsrfMiddleware::class); // optional global middleware

};