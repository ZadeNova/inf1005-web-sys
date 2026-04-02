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

        if (isset($data['status'])) {
            $status  = strtolower($data['status']);
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

    /**
     * POST /api/v1/admin/assets
     *
     * Accepts multipart/form-data. Validates input, handles image upload,
     * then wraps two INSERTs in a transaction:
     *   1. INSERT INTO assets
     *   2. INSERT INTO listings  (asset goes live immediately, admin is seller)
     *
     * Fields: name, description, rarity, condition_state, collection, price, image (file)
     *
     * Returns 201: { success: true, asset: { id, name, listingId } }
     * Returns 422: { success: false, message: '...' }
     * Returns 500: { success: false, message: '...' }
     */
    public function createAsset(Request $request, Response $response): Response
    {
        // ── 1. Parse text fields from multipart body ──────────────────────
        $data = $request->getParsedBody() ?? [];

        $name           = trim($data['name']           ?? '');
        $description    = trim($data['description']    ?? '');
        $rarity         = trim($data['rarity']         ?? '');
        $condition_state = trim($data['condition_state'] ?? 'Mint');
        $collection     = trim($data['collection']     ?? '');
        $price          = isset($data['price']) ? (float) $data['price'] : 0.0;

        // ── 2. Validate text fields ───────────────────────────────────────
        $allowedRarities = ['COMMON', 'UNCOMMON', 'RARE', 'ULTRA_RARE', 'SECRET_RARE'];
        $allowedConditions = ['Mint', 'Near Mint', 'Lightly Played', 'Moderately Played', 'Heavily Played'];

        if (!$name) {
            return $this->json($response, ['success' => false, 'message' => 'Asset name is required.'], 422);
        }
        if (!$description) {
            return $this->json($response, ['success' => false, 'message' => 'Description is required.'], 422);
        }
        if (!in_array($rarity, $allowedRarities, true)) {
            return $this->json($response, [
                'success' => false,
                'message' => 'Invalid rarity. Must be one of: ' . implode(', ', $allowedRarities),
            ], 422);
        }
        if (!in_array($condition_state, $allowedConditions, true)) {
            return $this->json($response, [
                'success' => false,
                'message' => 'Invalid condition. Must be one of: ' . implode(', ', $allowedConditions),
            ], 422);
        }
        if (!$collection) {
            return $this->json($response, ['success' => false, 'message' => 'Collection is required.'], 422);
        }
        if ($price <= 0 || $price > 999999.99) {
            return $this->json($response, ['success' => false, 'message' => 'Price must be between $0.01 and $999,999.99.'], 422);
        }

        // ── 3. Validate and handle image upload ───────────────────────────
        $allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp'];
        $uploadDir        = '/var/www/public/images/assets/uploads/';

        if (!is_dir($uploadDir)) {
            mkdir($uploadDir, 0755, true);
        }

        // Always read from $_FILES — Slim's body parsing middleware can consume
        // the multipart stream before getUploadedFiles() sees it.
        if (empty($_FILES['image']['tmp_name']) || $_FILES['image']['error'] !== UPLOAD_ERR_OK) {
            return $this->json($response, [
                'success' => false,
                'message' => 'Image upload failed or was not provided. Error code: ' . ($_FILES['image']['error'] ?? 'none'),
            ], 422);
        }

        $tmpPath  = $_FILES['image']['tmp_name'];
        $mimeType = mime_content_type($tmpPath);

        if (!in_array($mimeType, $allowedMimeTypes, true)) {
            return $this->json($response, [
                'success' => false,
                'message' => 'Invalid image type. Only JPEG, PNG, and WebP are allowed.',
            ], 422);
        }

        $originalName  = basename($_FILES['image']['name'] ?? 'upload');
        $filename      = uniqid('asset_', true) . '_' . $originalName;
        $filename      = preg_replace('/[^a-zA-Z0-9_.\-]/', '_', $filename);
        $destPath      = $uploadDir . $filename;
        $movedFilePath = null;

        if (!move_uploaded_file($tmpPath, $destPath)) {
            return $this->json($response, [
                'success' => false,
                'message' => 'Failed to save uploaded image. Check directory permissions.',
            ], 500);
        }

        $movedFilePath = $destPath;
        $imageUrl      = '/images/assets/uploads/' . $filename;

        // ── 4. Transactional DB writes ────────────────────────────────────
        $sellerId = (int) $_SESSION['user_id'];

        try {
            $this->db->beginTransaction();

            // INSERT assets (no base_price column — price lives on listings)
            $assetStmt = $this->db->prepare("
                INSERT INTO assets (name, description, image_url, rarity, collection, condition_state)
                VALUES (:name, :description, :image_url, :rarity, :collection, :condition_state)
            ");
            $assetStmt->execute([
                ':name'            => $name,
                ':description'     => $description,
                ':image_url'       => $imageUrl,
                ':rarity'          => $rarity,
                ':collection'      => $collection,
                ':condition_state' => $condition_state,
            ]);
            $assetId = (int) $this->db->lastInsertId();

            // INSERT listing — asset goes live immediately, admin is seller
            $listingStmt = $this->db->prepare("
                INSERT INTO listings (seller_id, asset_id, price, status)
                VALUES (:seller_id, :asset_id, :price, 'active')
            ");
            $listingStmt->execute([
                ':seller_id' => $sellerId,
                ':asset_id'  => $assetId,
                ':price'     => $price,
            ]);
            $listingId = (int) $this->db->lastInsertId();

            $this->db->commit();

            return $this->json($response, [
                'success' => true,
                'asset'   => [
                    'id'        => $assetId,
                    'name'      => $name,
                    'listingId' => $listingId,
                ],
            ], 201);

        } catch (\PDOException $e) {
            if ($this->db->inTransaction()) {
                $this->db->rollBack();
            }
            // Clean up the uploaded file so we don't leave orphaned images
            if ($movedFilePath && file_exists($movedFilePath)) {
                unlink($movedFilePath);
            }
            error_log('AdminController::createAsset DB error: ' . $e->getMessage());
            return $this->json($response, [
                'success' => false,
                'message' => 'Failed to create asset. Please try again.',
            ], 500);
        }
    }

    private function json(Response $response, array $data, int $status = 200): Response
    {
        $response->getBody()->write(json_encode($data, JSON_UNESCAPED_UNICODE));
        return $response
            ->withHeader('Content-Type', 'application/json')
            ->withStatus($status);
    }
}