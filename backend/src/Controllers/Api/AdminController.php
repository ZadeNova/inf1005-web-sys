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
            INSERT INTO blog_posts (author_id, title, body, category)
            VALUES (:author, :title, :body, :category)
");
        $stmt->execute([
            ':author'   => $_SESSION['user_id'],
            ':title'    => $title,
            ':body'     => $body,
            ':category' => trim($data['category'] ?? 'Market Update'),
]);

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



    public function editBlogPost(Request $request, Response $response, array $args): Response
    {
        $id   = (int)($args['id'] ?? 0);
        $data = $request->getParsedBody() ?? [];
        $this->db->prepare("
            UPDATE blog_posts SET title = :title, body = :body, category = :category
            WHERE id = :id
        ")->execute([
            ':title'    => trim($data['title'] ?? ''),
            ':body'     => trim($data['body'] ?? ''),
            ':category' => trim($data['category'] ?? 'Market Update'),
            ':id'       => $id,
        ]);
        return $this->json($response, ['success' => true]);
    }

    public function deleteBlogPost(Request $request, Response $response, array $args): Response
    {
        $id = (int)($args['id'] ?? 0);
        $this->db->prepare("DELETE FROM blog_posts WHERE id = :id")
                ->execute([':id' => $id]);
        return $this->json($response, ['success' => true]);
    }


    // POST /api/v1/admin/assets
    public function createAsset(Request $request, Response $response): Response
    {
        $data = $request->getParsedBody() ?? [];

        $name       = trim($data['name']        ?? '');
        $description= trim($data['description'] ?? '');
        $rarity     = trim($data['rarity']      ?? '');
        $collection = trim($data['collection']  ?? '');
        $image_url  = trim($data['image_url']   ?? '');
        $base_price = (float) ($data['base_price'] ?? 0);

        $allowed_rarities = ['COMMON', 'UNCOMMON', 'RARE', 'EPIC', 'LEGENDARY'];

        if (!$name || !$description || !$rarity || !$collection || !$image_url || $base_price <= 0) {
            return $this->json($response, ['success' => false, 'message' => 'All fields are required.'], 422);
        }

        if (!in_array($rarity, $allowed_rarities, true)) {
            return $this->json($response, ['success' => false, 'message' => 'Invalid rarity.'], 422);
        }

        $stmt = $this->db->prepare("
            INSERT INTO assets (name, description, rarity, collection, image_url, base_price)
            VALUES (:name, :description, :rarity, :collection, :image_url, :base_price)
        ");
        $stmt->execute([
            ':name'        => $name,
            ':description' => $description,
            ':rarity'      => $rarity,
            ':collection'  => $collection,
            ':image_url'   => $image_url,
            ':base_price'  => $base_price,
        ]);

        $id = (int) $this->db->lastInsertId();

        return $this->json($response, [
            'success' => true,
            'asset'   => ['id' => $id, 'name' => $name]
        ], 201);
    }

}