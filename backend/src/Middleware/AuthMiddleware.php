<?php

/**
 * owner: jeremy
 * Protects routes that require user login 
 * Checks $_SESSION['user_id'] which is set by AuthService::login()
 * 
 * API routes (/api/*) → returns 401 JSON
 * Page routes (/dashboard) → redirects to /login
 */

namespace App\Middleware;

use App\Services\AuthService;
use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;
use Psr\Http\Server\MiddlewareInterface;
use Psr\Http\Server\RequestHandlerInterface as Handler;
use Slim\Psr7\Response as SlimResponse;

class AuthMiddleware implements MiddlewareInterface
{
    private AuthService $authService;
    // Constructor to inject the AuthService dependency
    public function __construct(AuthService $authService)
    {
        $this->authService = $authService;
    }

    public function process(Request $request, Handler $handler): Response
    {
        // If the user is logged in, proceed
        if ($this->authService->isLoggedIn()) {
            return $handler->handle($request);
        }

        $path = $request->getUri()->getPath();

        // If it's an API route, return a 401 JSON response
        if (str_starts_with($path, '/api/')) {
            $response = new SlimResponse();
            $response->getBody()->write(json_encode([
                'success' => false,
                'message' => 'Authentication required. Please log in.',
            ]));
            return $response
                ->withHeader('Content-Type', 'application/json')
                ->withStatus(401);
        }

        $response = new SlimResponse();
        return $response
            ->withHeader('Location', '/login')
            ->withStatus(302);
    }
}

