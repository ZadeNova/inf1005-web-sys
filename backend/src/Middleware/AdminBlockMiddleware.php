<?php
namespace App\Middleware;

use App\Services\AuthService;
use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;
use Psr\Http\Server\MiddlewareInterface;
use Psr\Http\Server\RequestHandlerInterface as Handler;
use Slim\Psr7\Response as SlimResponse;

/**
 * AdminBlockMiddleware
 * Prevents admin accounts from accessing user-only pages
 * (dashboard, profile). Redirects them to /admin instead.
 */
class AdminBlockMiddleware implements MiddlewareInterface
{
    private AuthService $authService;

    public function __construct(AuthService $authService)
    {
        $this->authService = $authService;
    }

    public function process(Request $request, Handler $handler): Response
    {
        if ($this->authService->isAdmin()) {
            $response = new SlimResponse();
            return $response
                ->withHeader('Location', '/admin')
                ->withStatus(302);
        }

        return $handler->handle($request);
    }
}