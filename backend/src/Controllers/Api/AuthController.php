<?php
/**
 * Handles auth API endpoints. Validates input, calls AuthService, , returns JSON
 * All POST routes are CSRF-protected via CsrfMiddleware
 * 
 * Endpoints:
 *  POST /api/v1/auth/register  -> create account
 *  POST /api/v1/auth/login     -> email + password login
 *  POST /api/v1/auth/logout    -> destroy session
 *  GET  /api/v1/auth/me        -> get current user data
 */
namespace App\Controllers\Api;

// PSR-7 interfaces for request/response
use App\Services\AuthService;
use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;

class AuthController
{
    private AuthService $authService;

    public function __construct(AuthService $authService)
    {
        $this->authService = $authService;
    }

    //POST /api/v1/auth/register

    public function register(Request $request, Response $response): Response
    {
        // Parse JSON body (Slim's body parsing middleware converts it)
        $data = $request->getParsedBody() ?? [];

        $email           = trim($data['email'] ?? '');
        $password        = $data['password'] ?? '';
        $confirmPassword = $data['confirm_password'] ?? '';
        $username        = trim($data['username'] ?? '');

        // Collect ALL errors before returning
        $errors = [];

        // Email: filter_var checks for valid format
        if (empty($email) || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
            $errors['email'] = 'Please enter a valid email address.';
        }

        // Username: 3-30 chars, alphanumeric + underscore
        // Matches init.sql VARCHAR(48) column
        if (empty($username) || !preg_match('/^[a-zA-Z0-9_]{3,30}$/', $username)) {
            $errors['username'] = 'Username must be 3–30 characters (letters, numbers, underscores).';
        }

        // Password: 8+ chars, uppercase, lowercase, digit
        if (empty($password) || !preg_match('/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/', $password)) {
            $errors['password'] = 'Password must be at least 8 characters with uppercase, lowercase, and a number.';
        }

        // Confirm password match
        if ($password !== $confirmPassword) {
            $errors['confirm_password'] = 'Passwords do not match.';
        }

        if (!empty($errors)) {
            return $this->json($response, [
                'success' => false,
                'message' => 'Please fix the errors below.',
                'errors'  => $errors,
            ], 422);
        }

        // Call service
        $result = $this->authService->register($email, $password, $username);

        $statusCode = $result['success'] ? 201 : 400;
        return $this->json($response, $result, $statusCode);
    }

    // POST /api/v1/auth/login
    public function login(Request $request, Response $response): Response
    {
        $data = $request->getParsedBody() ?? [];

        $email    = strtolower(trim($data['email'] ?? ''));
        $password = $data['password'] ?? '';

        $errors = [];
        // Check login fields
        if (empty($email) || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
            $errors['email'] = 'Please enter a valid email address.';
        }

        if (empty($password)) {
            $errors['password'] = 'Please enter your password.';
        }

        if (!empty($errors)) {
            return $this->json($response, [
                'success' => false,
                'message' => 'Please fill in all fields.',
                'errors'  => $errors,
            ], 422);
        }

        $result = $this->authService->login($email, $password);

        $statusCode = $result['success'] ? 200 : 401;
        return $this->json($response, $result, $statusCode);
    }

    // POST /api/v1/auth/logout
    public function logout(Request $request, Response $response): Response
    {
        $this->authService->logout();

        return $this->json($response, [
            'success' => true,
            'message' => 'Logged out successfully.',
        ]);
    }

    //GET /api/v1/auth/me

    public function me(Request $request, Response $response): Response
    {
        $user = $this->authService->getCurrentUser();

        if (!$user) {
            return $this->json($response, [
                'success'       => false,
                'authenticated' => false,
                'message'       => 'Not logged in.',
            ], 401);
        }

        return $this->json($response, [
            'success'       => true,
            'authenticated' => true,
            'user'          => $user,
        ]);
    }
    // HELPER: JSON response
    // Encodes data as JSON and sets appropriate headers
    private function json(Response $response, array $data, int $status = 200): Response
    {
        $response->getBody()->write(json_encode($data, JSON_UNESCAPED_UNICODE));
        return $response
            ->withHeader('Content-Type', 'application/json')
            ->withStatus($status);
    }

    // POST /api/v1/auth/change-password
public function changePassword(Request $request, Response $response): Response
{
    $user = $this->authService->getCurrentUser();
    if (!$user) {
        return $this->json($response, ['success' => false, 'message' => 'Not logged in.'], 401);
    }

    $data            = $request->getParsedBody() ?? [];
    $currentPassword = $data['current_password'] ?? '';
    $newPassword     = $data['new_password']     ?? '';

    if (empty($currentPassword) || empty($newPassword)) {
        return $this->json($response, ['success' => false, 'message' => 'All fields are required.'], 422);
    }

    if (strlen($newPassword) < 8) {
        return $this->json($response, ['success' => false, 'message' => 'New password must be at least 8 characters.'], 422);
    }

    $result = $this->authService->changePassword(
        (int) $user['id'],
        $currentPassword,
        $newPassword
    );

    $status = $result['success'] ? 200 : 400;
    return $this->json($response, $result, $status);
}
}