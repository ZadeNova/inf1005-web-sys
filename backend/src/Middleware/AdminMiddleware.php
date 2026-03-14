<?php
/**
 * owner: jeremy
 * Protects admin-only routes. Checks two conditions:
 * 1. User must be logged in (session exists)
 * 2. User's role in the database must be 'admin'
 * 
 * Routes: API routes → 403 JSON
 * Page routes → redirect to /
 */

namespace App\Middleware;

// Import necessary Slim and PSR-7 interfaces and classes
use App\Services\AuthService;
use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;
use Psr\Http\Server\MiddlewareInterface;
use Psr\Http\Server\RequestHandlerInterface as Handler;
use Slim\Psr7\Response as SlimResponse;

class AdminMiddleware implements MiddlewareInterface
{
    private AuthService $authService;
    // Constructor to inject the AuthService dependency
    public function __construct(AuthService $authService)
    {
        $this->authService = $authService;
    }

    public function process(Request $request, Handler $handler): Response
    {
        if ($this->authService->isLoggedIn() && $this->authService->isAdmin()) {
            return $handler->handle($request);
        }
        // Determine if the request is for an API route or a page route
        $path = $request->getUri()->getPath();

        if (str_starts_with($path, '/api/')) {
            $response = new SlimResponse();
            $response->getBody()->write(json_encode([
                'success' => false,
                'message' => 'Admin access required.',
            ]));
            return $response
                ->withHeader('Content-Type', 'application/json')
                ->withStatus(403);
        }

        // For page routes, redirect to the homepage
        $response = new SlimResponse();
        return $response
            ->withHeader('Location', '/')
            ->withStatus(302);
    }
}
