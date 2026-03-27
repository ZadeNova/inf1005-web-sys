<?php
namespace App\Controllers\Api;

use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;

class BlogController
{
    private \PDO $db;

    public function __construct(\PDO $db)
    {
        $this->db = $db;
    }

    /**
     * GET /api/v1/blog/posts
     * FIX: now reads category from DB instead of hardcoding 'Market Update'
     */
    public function index(Request $request, Response $response): Response
    {
        $stmt = $this->db->query("
            SELECT bp.id, bp.title, bp.body, bp.category, bp.created_at, bp.updated_at,
                   u.username AS author
            FROM blog_posts bp
            JOIN users u ON u.id = bp.author_id
            ORDER BY bp.created_at DESC
            LIMIT 50
        ");
        $posts = $stmt->fetchAll(\PDO::FETCH_ASSOC);

        $shaped = array_map(fn($p) => [
            'id'          => (string) $p['id'],
            'title'       => $p['title'],
            'excerpt'     => mb_substr(strip_tags($p['body']), 0, 160) . '...',
            'author'      => $p['author'],
            'publishedAt' => $p['created_at'],
            'category'    => $p['category'] ?? 'Market Update', // FIX: reads from DB
            'imageUrl'    => null,
        ], $posts);

        return $this->json($response, ['posts' => $shaped]);
    }

    /**
     * POST /api/v1/blog/posts
     * FIX: now saves category to DB
     */
    public function store(Request $request, Response $response): Response
    {
        $user = $request->getAttribute('user') ?? ['id' => $_SESSION['user_id']];
        $data = $request->getParsedBody() ?? [];

        $title    = trim($data['title']    ?? '');
        $body     = trim($data['body']     ?? '');
        $category = trim($data['category'] ?? 'Market Update');

        if (!$title || !$body) {
            return $this->json($response, ['success' => false, 'message' => 'Title and body required.'], 422);
        }

        // FIX: now persists category to the blog_posts table
        $stmt = $this->db->prepare("
            INSERT INTO blog_posts (author_id, title, body, category)
            VALUES (:author, :title, :body, :category)
        ");
        $stmt->execute([
            ':author'   => $user['id'],
            ':title'    => $title,
            ':body'     => $body,
            ':category' => $category,
        ]);

        return $this->json($response, ['success' => true, 'message' => 'Post published.'], 201);
    }

    private function json(Response $response, array $data, int $status = 200): Response
    {
        $response->getBody()->write(json_encode($data, JSON_UNESCAPED_UNICODE));
        return $response->withHeader('Content-Type', 'application/json')->withStatus($status);
    }

    public function show(Request $request, Response $response, array $args): Response
    {
        $stmt = $this->db->prepare("
            SELECT bp.id, bp.title, bp.body, bp.category, bp.created_at,
                u.username AS author
            FROM blog_posts bp
            JOIN users u ON u.id = bp.author_id
            WHERE bp.id = :id
        ");
        $stmt->execute([':id' => (int)$args['id']]);
        $post = $stmt->fetch(\PDO::FETCH_ASSOC);

        if (!$post) {
            return $this->json($response, ['message' => 'Post not found'], 404);
        }
        return $this->json($response, ['post' => $post]);
    }


}