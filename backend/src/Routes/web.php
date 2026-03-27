<?php

declare(strict_types=1);

use Slim\App;
use App\Controllers\PageController;
use App\Middleware\AuthMiddleware;
use App\Middleware\AdminMiddleware;

return function (App $app) {

    // Public Routes
    $app->get('/', [PageController::class, 'home']);
    $app->get('/about', [PageController::class, 'about']);
    $app->get('/login', [PageController::class, 'login']);
    $app->get('/register', [PageController::class, 'register']);
    $app->get('/listings', [PageController::class, 'listings']);
    $app->get('/blog', [PageController::class, 'blog']);

    // Protected Routes (AuthMiddleware added later)
    $app->get('/dashboard', [PageController::class, 'dashboard'])
        ->add(AuthMiddleware::class);
    $app->get('/profile', [PageController::class, 'profile'])
        ->add(AuthMiddleware::class);
    
    // Admin Routes (AdminMiddleware added later)
    $app->get('/admin', [PageController::class, 'admin'])
        ->add(AdminMiddleware::class);


    $app->get('/blog/{id}', [PageController::class, 'blogPost']);
};