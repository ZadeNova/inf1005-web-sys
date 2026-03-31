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

    /**
     * GET /api/v1/admin/listings
     *
     * FIX: Added seller_id to SELECT so the frontend has it if needed.
     * FIX: status is returned as lowercase from the DB ENUM — no transformation
     *   applied here so the frontend receives the raw DB value ('active',
     *   'sold', 'cancelled'). The previous version was fine but components
     *   were comparing against uppercase strings — components now fixed.
     * FIX: LIMIT increased to 200 so the admin can see all listings.
     */
    public function listings(Request $request, Response $response): Response
    {
        $stmt = $this->db->query("
            SELECT
                l.id,
                l.price,
                l.status,
                l.created_at,
                l.seller_id,
                a.name,
                a.rarity,
                a.condition_state,
                u.username AS seller_username
            FROM listings l
            JOIN assets a ON a.id = l.asset_id
            JOIN users  u ON u.id = l.seller_id
            ORDER BY l.created_at DESC
            LIMIT 200
        ");
        return $this->json($response, [
            'success'  => true,
            'listings' => $stmt->fetchAll(\PDO::FETCH_ASSOC),
        ]);
    }

    /**
     * POST /api/v1/admin/news
     * Used by CreateNewsPost.jsx
     */
    public function createNews(Request $request, Response $response): Response
    {
        $data     = $request->getParsedBody() ?? [];
        $title    = trim($data['title']    ?? '');
        $body     = trim($data['body']     ?? '');
        $category = trim($data['category'] ?? 'Market Update');

        if (!$title || !$body) {
            return $this->json($response, [
                'success' => false,
                'message' => 'Title and body are required.',
            ], 422);
        }

        $stmt = $this->db->prepare("
            INSERT INTO blog_posts (author_id, title, body, category)
            VALUES (:author, :title, :body, :category)
        ");
        $stmt->execute([
            ':author'   => $_SESSION['user_id'],
            ':title'    => $title,
            ':body'     => $body,
            ':category' => $category,
        ]);

        return $this->json($response, ['success' => true], 201);
    }

    /**
     * PATCH /api/v1/admin/listings/{id}
     *
     * FIX: Status values are normalised to lowercase to match the DB ENUM.
     * Accepts both 'cancelled' (from frontend) and 'CANCELLED' (legacy) —
     * both are stored as lowercase in the DB.
     */
    public function editListing(Request $request, Response $response, array $args): Response
    {
        $id   = (int) ($args['id'] ?? 0);
        $data = $request->getParsedBody() ?? [];

        if ($id <= 0) {
            return $this->json($response, [
                'success' => false,
                'message' => 'Invalid listing ID.',
            ], 422);
        }

        $fields  = [];
        $params  = [':id' => $id];

        // Update price if provided
        if (isset($data['price'])) {
            $price = (float) $data['price'];
            if ($price <= 0 || $price > 999999.99) {
                return $this->json($response, [
                    'success' => false,
                    'message' => 'Price must be between $0.01 and $999,999.99.',
                ], 422);
            }
            $fields[]         = 'price = :price';
            $params[':price'] = $price;
        }

        // Update status if provided — normalise to lowercase
        if (isset($data['status'])) {
            $status = strtolower($data['status']);
            $allowed = ['active', 'sold', 'cancelled'];
            if (!in_array($status, $allowed, true)) {
                return $this->json($response, [
                    'success' => false,
                    'message' => 'Status must be one of: active, sold, cancelled.',
                ], 422);
            }
            $fields[]          = 'status = :status';
            $params[':status'] = $status;
        }

        if (empty($fields)) {
            return $this->json($response, [
                'success' => false,
                'message' => 'No fields to update.',
            ], 422);
        }

        $stmt = $this->db->prepare(
            "UPDATE listings SET " . implode(', ', $fields) . " WHERE id = :id"
        );
        $stmt->execute($params);

        return $this->json($response, ['success' => true]);
    }

    /**
     * DELETE /api/v1/admin/listings/{id}
     */
    public function deleteListing(Request $request, Response $response, array $args): Response
    {
        $id = (int) ($args['id'] ?? 0);

        if ($id <= 0) {
            return $this->json($response, [
                'success' => false,
                'message' => 'Invalid listing ID.',
            ], 422);
        }

        $this->db->prepare("DELETE FROM listings WHERE id = :id")
                 ->execute([':id' => $id]);

        return $this->json($response, ['success' => true]);
    }

    /**
     * PATCH /api/v1/admin/blog/posts/{id}
     */
    public function editBlogPost(Request $request, Response $response, array $args): Response
    {
        $id   = (int) ($args['id'] ?? 0);
        $data = $request->getParsedBody() ?? [];

        $title    = trim($data['title']    ?? '');
        $body     = trim($data['body']     ?? '');
        $category = trim($data['category'] ?? 'Market Update');

        if (!$title || !$body) {
            return $this->json($response, [
                'success' => false,
                'message' => 'Title and body are required.',
            ], 422);
        }

        $this->db->prepare("
            UPDATE blog_posts
            SET title = :title, body = :body, category = :category
            WHERE id = :id
        ")->execute([
            ':title'    => $title,
            ':body'     => $body,
            ':category' => $category,
            ':id'       => $id,
        ]);

        return $this->json($response, ['success' => true]);
    }

    /**
     * DELETE /api/v1/admin/blog/posts/{id}
     */
    public function deleteBlogPost(Request $request, Response $response, array $args): Response
    {
        $id = (int) ($args['id'] ?? 0);

        if ($id <= 0) {
            return $this->json($response, [
                'success' => false,
                'message' => 'Invalid post ID.',
            ], 422);
        }

        $this->db->prepare("DELETE FROM blog_posts WHERE id = :id")
                 ->execute([':id' => $id]);

        return $this->json($response, ['success' => true]);
    }

    private function json(Response $response, array $data, int $status = 200): Response
    {
        $response->getBody()->write(json_encode($data, JSON_UNESCAPED_UNICODE));
        return $response
            ->withHeader('Content-Type', 'application/json')
            ->withStatus($status);
    }
}