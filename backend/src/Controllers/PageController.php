<?php

declare(strict_types=1);

namespace App\Controllers;

use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;

class PageController
{
    // Helper: renders a view and writes it to the response
    private function render(Response $response, string $view, array $data = []): Response
    {
        // Extract data array into variables for the view
        extract($data);

        ob_start();
        require __DIR__ . '/../Views/' . $view . '.php';
        $content = ob_get_clean();

        $response->getBody()->write($content);
        return $response;
    }

    public function home(Request $request, Response $response): Response
    {
        return $this->render($response, 'home', [
            'title' => 'Vapour FT — Digital Asset Marketplace'
        ]);
    }

    public function about(Request $request, Response $response): Response
    {
        return $this->render($response, 'about', [
            'title' => 'About Us — Vapour FT'
        ]);
    }

    public function login(Request $request, Response $response): Response
    {
        return $this->render($response, 'login', [
            'title' => 'Login — Vapour FT'
        ]);
    }

    public function register(Request $request, Response $response): Response
    {
        return $this->render($response, 'register', [
            'title' => 'Register — Vapour FT'
        ]);
    }

    public function listings(Request $request, Response $response): Response
    {
        return $this->render($response, 'listings', [
            'title' => 'Market Listings — Vapour FT'
        ]);
    }

    public function blog(Request $request, Response $response): Response
    {
        return $this->render($response, 'blog', [
            'title' => 'Market News — Vapour FT'
        ]);
    }

    public function dashboard(Request $request, Response $response): Response
    {
        return $this->render($response, 'dashboard', [
            'title' => 'Dashboard — Vapour FT'
        ]);
    }

    public function profile(Request $request, Response $response): Response
    {
        return $this->render($response, 'profile', [
            'title' => 'My Profile — Vapour FT'
        ]);
    }

    public function admin(Request $request, Response $response): Response
    {
        return $this->render($response, 'admin', [
            'title' => 'Admin Panel — Vapour FT'
        ]);
    }
}