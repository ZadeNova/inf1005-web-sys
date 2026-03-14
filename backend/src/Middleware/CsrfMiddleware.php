<?php
/** 
 * owner: jeremy
 * Validates CSRF tokens on POST/PUT/DELETE/PATCH requests
 * 
 * 
 * Token flow: $_SESSION -> layout.php <meta> tag -> React header -> csrf middleware
 * Uses hash_equals() for timing-safe comparison
 */

namespace App\Middleware;

use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;
use Psr\Http\Server\MiddlewareInterface;
use Psr\Http\Server\RequestHandlerInterface as Handler;
use Slim\Psr7\Response as SlimResponse;

class CsrfMiddleware implements MiddlewareInterface
{
    public function process(Request $request, Handler $handler): Response
    {
        $method = $request->getMethod();
        // Only validate CSRF token for state-changing methods
        if (in_array($method, ['POST', 'PUT', 'DELETE', 'PATCH'])) {
            
            // Get the token from the header and session
            $headerToken  = $request->getHeaderLine('X-CSRF-Token');
            $sessionToken = $_SESSION['csrf_token'] ?? '';

            // Validate the token using hash_equals for timing-safe comparison
            //check if token is missing or if they don't match
            if (empty($headerToken) || empty($sessionToken) || !hash_equals($sessionToken, $headerToken)) {
                $response = new SlimResponse();
                $response->getBody()->write(json_encode([
                    'success' => false,
                    'message' => 'Invalid or missing CSRF token. Please refresh the page and try again.',
                ]));
                return $response
                    ->withHeader('Content-Type', 'application/json')
                    ->withStatus(403);
            }
        }
        return $handler->handle($request);
    }
}
