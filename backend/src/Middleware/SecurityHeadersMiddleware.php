<?php

/**
 * owner: Jeremy
 * Adds HTTP security headers to every response.
 *
 * X-Frame-Options         — prevents clickjacking (iframe embedding)
 * X-Content-Type-Options  — prevents MIME-type sniffing
 * Referrer-Policy         — controls how much referrer info is sent
 * Content-Security-Policy — restricts sources for scripts/styles/etc.
 *
 * Registered globally in index.php before route middleware.
 */

namespace App\Middleware;

use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;
use Psr\Http\Server\MiddlewareInterface;
use Psr\Http\Server\RequestHandlerInterface as Handler;

class SecurityHeadersMiddleware implements MiddlewareInterface
{
    public function process(Request $request, Handler $handler): Response
    {
        $response = $handler->handle($request);

        return $response
            ->withHeader('X-Frame-Options', 'SAMEORIGIN')
            ->withHeader('X-Content-Type-Options', 'nosniff')
            ->withHeader('Referrer-Policy', 'strict-origin-when-cross-origin')
            ->withHeader(
                'Content-Security-Policy',
                "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'"
            );
    }
}