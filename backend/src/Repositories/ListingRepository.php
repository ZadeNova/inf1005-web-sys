<?php

namespace App\Repositories;

class ListingRepository
{
    private \PDO $db;

    public function __construct(\PDO $db)
    {
        $this->db = $db;
    }

    /**
     * Fetch active listings with optional filters, sort, and pagination.
     * Returns listings joined with asset + seller info.
     */
    public function findActive(array $filters = [], string $sort = 'newest', int $page = 1): array
    {
        $where  = ['l.status = :status'];
        $params = [':status' => 'active'];

        if (!empty($filters['search'])) {
            $where[]            = 'a.name LIKE :search';
            $params[':search']  = '%' . $filters['search'] . '%';
        }

        if (!empty($filters['rarity'])) {
            $where[]           = 'a.rarity = :rarity';
            $params[':rarity'] = $filters['rarity'];
        }

        if (!empty($filters['condition'])) {
            $where[]              = 'a.condition_state = :condition';
            $params[':condition'] = $filters['condition'];
        }

        $orderBy = match ($sort) {
            'price_asc'  => 'l.price ASC',
            'price_desc' => 'l.price DESC',
            default      => 'l.created_at DESC',   // 'newest'
        };

        $perPage = 20;
        $offset  = ($page - 1) * $perPage;

        $sql = "
            SELECT
                l.id, l.price, l.status, l.created_at,
                a.id          AS asset_id,
                a.name        AS asset_name,
                a.rarity,
                a.condition_state,
                a.image_url,
                a.collection,
                u.id          AS seller_id,
                u.username    AS seller_username
            FROM listings l
            JOIN assets a ON a.id = l.asset_id
            JOIN users  u ON u.id = l.seller_id
            WHERE " . implode(' AND ', $where) . "
            ORDER BY {$orderBy}
            LIMIT :limit OFFSET :offset
        ";

        $stmt = $this->db->prepare($sql);
        foreach ($params as $key => $value) {
            $stmt->bindValue($key, $value);
        }
        $stmt->bindValue(':limit',  $perPage, \PDO::PARAM_INT);
        $stmt->bindValue(':offset', $offset,  \PDO::PARAM_INT);
        $stmt->execute();

        return $stmt->fetchAll(\PDO::FETCH_ASSOC);
    }

    /**
     * Find a single listing by ID, regardless of status.
     * Used by executePurchase to lock the row.
     */
public function findById(int $id): array|false
    {
        $stmt = $this->db->prepare("
            SELECT l.id, l.price, l.status, l.created_at,
                   a.id          AS asset_id,
                   a.name        AS asset_name,
                   a.rarity,
                   a.condition_state,
                   a.image_url,
                   a.description AS asset_description,
                   a.collection  AS asset_collection,
                   u.username    AS seller_username
            FROM listings l
            JOIN assets  a ON a.id = l.asset_id
            JOIN users   u ON u.id = l.seller_id
            WHERE l.id = :id
            LIMIT 1
        ");
        $stmt->execute([':id' => $id]);
        return $stmt->fetch(\PDO::FETCH_ASSOC);
    }

    /**
     * Find all listings belonging to a user (any status).
     */
    public function findByUser(int $userId): array
    {
        $stmt = $this->db->prepare("
            SELECT
                l.id, l.price, l.status, l.created_at,
                a.name AS asset_name, a.rarity, a.condition_state, a.image_url
            FROM listings l
            JOIN assets a ON a.id = l.asset_id
            WHERE l.seller_id = :userId
            ORDER BY l.created_at DESC
        ");
        $stmt->execute([':userId' => $userId]);
        return $stmt->fetchAll(\PDO::FETCH_ASSOC);
    }

    /**
     * Insert a new listing row. Returns the new listing ID.
     */
    public function create(int $sellerId, int $assetId, float $price): int
    {
        $stmt = $this->db->prepare("
            INSERT INTO listings (seller_id, asset_id, price, status)
            VALUES (:sellerId, :assetId, :price, 'active')
        ");
        $stmt->execute([
            ':sellerId' => $sellerId,
            ':assetId'  => $assetId,
            ':price'    => $price,
        ]);
        return (int) $this->db->lastInsertId();
    }

    /**
     * Update listing status — called with 'sold' or 'cancelled'.
     */
    public function updateStatus(int $id, string $status): void
    {
        $stmt = $this->db->prepare("
            UPDATE listings SET status = :status WHERE id = :id
        ");
        $stmt->execute([':status' => $status, ':id' => $id]);
    }
}