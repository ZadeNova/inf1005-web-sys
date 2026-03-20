<?php
namespace App\Controllers\Api;

use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;

class AdminController
{
    private \PDO $db;

    public function __construct(\PDO $db)
    {
        $this->db = $db;
    }

    // GET /api/v1/admin/listings
    public function listings(Request $request, Response $response): Response
    {
        $stmt = $this->db->query("
            SELECT l.id, l.price, l.status, l.created_at,
                   a.name, a.rarity, a.condition_state,
                   u.username AS seller_username
            FROM listings l
            JOIN assets a ON a.id = l.asset_id
            JOIN users  u ON u.id = l.seller_id
            ORDER BY l.created_at DESC
            LIMIT 100
        ");
        return $this->json($response, ['listings' => $stmt->fetchAll(\PDO::FETCH_ASSOC)]);
    }

    // POST /api/v1/admin/news  (used by CreateNewsPost.jsx)
    public function createNews(Request $request, Response $response): Response
    {
        $data  = $request->getParsedBody() ?? [];
        $title = trim($data['title']    ?? '');
        $body  = trim($data['body']     ?? '');

        if (!$title || !$body) {
            return $this->json($response, ['success' => false, 'message' => 'Title and body required.'], 422);
        }

        $stmt = $this->db->prepare("
            INSERT INTO blog_posts (author_id, title, body) VALUES (:author, :title, :body)
        ");
        $stmt->execute([':author' => $_SESSION['user_id'], ':title' => $title, ':body' => $body]);

        return $this->json($response, ['success' => true], 201);
    }

    // PATCH /api/v1/admin/listings/{id}
    public function editListing(Request $request, Response $response, array $args): Response
    {
        $id   = (int) ($args['id'] ?? 0);
        $data = $request->getParsedBody() ?? [];

        $stmt = $this->db->prepare("
            UPDATE listings SET price = :price, status = :status WHERE id = :id
        ");
        $stmt->execute([
            ':price'  => (float) ($data['price']  ?? 0),
            ':status' => $data['status'] ?? 'active',
            ':id'     => $id,
        ]);

        return $this->json($response, ['success' => true]);
    }

    // DELETE /api/v1/admin/listings/{id}
    public function deleteListing(Request $request, Response $response, array $args): Response
    {
        $id = (int) ($args['id'] ?? 0);
        $this->db->prepare("DELETE FROM listings WHERE id = :id")->execute([':id' => $id]);
        return $this->json($response, ['success' => true]);
    }

    private function json(Response $response, array $data, int $status = 200): Response
    {
        $response->getBody()->write(json_encode($data, JSON_UNESCAPED_UNICODE));
        return $response->withHeader('Content-Type', 'application/json')->withStatus($status);
    }
}