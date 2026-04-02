<?php

namespace App\Services;

use App\Repositories\ListingRepository;

class MarketService
{
    private \PDO               $db;
    private ListingRepository  $listings;
    private WalletService      $wallet;

    public function __construct(\PDO $db, ListingRepository $listings, WalletService $wallet)
    {
        $this->db       = $db;
        $this->listings = $listings;
        $this->wallet   = $wallet;
    }

    /**
     * Returns active listings, forwarding query params to the repository.
     */
    public function getListings(array $queryParams): array
    {
        $filters = [
            'search'    => $queryParams['search']    ?? '',
            'rarity'    => $queryParams['rarity']    ?? '',
            'condition' => $queryParams['condition'] ?? '',
        ];
        $sort  = $queryParams['sort'] ?? 'newest';
        $page  = max(1, (int) ($queryParams['page'] ?? 1));

        return [
            'listings' => $this->listings->findActive($filters, $sort, $page),
            'total'    => $this->listings->findActiveCount($filters),
            'perPage'  => 20,
            'page'     => $page,
        ];
    }

    /**
     * Create a sell listing.
     * Validates that the seller actually owns the asset and it isn't already listed.
     */
    public function createListing(int $sellerId, int $assetId, float $price): array
    {
        if ($price <= 0) {
            return ['success' => false, 'message' => 'Price must be greater than zero.'];
        }

        // Verify seller owns this asset
        $stmt = $this->db->prepare("
            SELECT id FROM inventory
            WHERE user_id = :uid AND asset_id = :aid
            LIMIT 1
        ");
        $stmt->execute([':uid' => $sellerId, ':aid' => $assetId]);
        if (!$stmt->fetch()) {
            return ['success' => false, 'message' => 'You do not own this asset.'];
        }

        // Verify it isn't already listed
        $stmt = $this->db->prepare("
            SELECT id FROM listings
            WHERE seller_id = :uid AND asset_id = :aid AND status = 'active'
            LIMIT 1
        ");
        $stmt->execute([':uid' => $sellerId, ':aid' => $assetId]);
        if ($stmt->fetch()) {
            return ['success' => false, 'message' => 'This asset is already listed.'];
        }

        $listingId = $this->listings->create($sellerId, $assetId, $price);

        return ['success' => true, 'listingId' => $listingId];
    }

    /**
     * Cancel a listing — only the seller can do this.
     */
    public function cancelListing(int $sellerId, int $listingId): array
    {
        $listing = $this->listings->findById($listingId);

        if (!$listing) {
            return ['success' => false, 'message' => 'Listing not found.'];
        }
        if ((int) $listing['seller_id'] !== $sellerId) {
            return ['success' => false, 'message' => 'You do not own this listing.'];
        }
        if ($listing['status'] !== 'active') {
            return ['success' => false, 'message' => 'Listing is no longer active.'];
        }

        $this->listings->updateStatus($listingId, 'cancelled');

        return ['success' => true, 'message' => 'Listing cancelled.'];
    }

    /**
     * Task 3 — Atomic purchase. See full implementation below.
     */
    public function executePurchase(int $buyerId, int $listingId): array
    {
    try {
        $this->db->beginTransaction();

        // --- 1. Lock the listing row and verify it's still active ---
        $stmt = $this->db->prepare("
            SELECT l.*, a.name AS asset_name
            FROM listings l
            JOIN assets a ON a.id = l.asset_id
            WHERE l.id = :id
            FOR UPDATE
        ");
        $stmt->execute([':id' => $listingId]);
        $listing = $stmt->fetch(\PDO::FETCH_ASSOC);

        if (!$listing || $listing['status'] !== 'active') {
            $this->db->rollBack();
            return ['success' => false, 'message' => 'Listing is no longer available.'];
        }

        $sellerId = (int) $listing['seller_id'];
        $assetId  = (int) $listing['asset_id'];
        $price    = (float) $listing['price'];

        // --- 2. Buyer cannot be the seller ---
        if ($buyerId === $sellerId) {
            $this->db->rollBack();
            return ['success' => false, 'message' => 'You cannot buy your own listing.'];
        }

        // --- 3. Lock both wallet rows to prevent race conditions ---
        // Lock in consistent ID order to avoid deadlock
        $firstId  = min($buyerId, $sellerId);
        $secondId = max($buyerId, $sellerId);

        $stmt = $this->db->prepare("
            SELECT user_id, balance FROM wallets
            WHERE user_id IN (:first, :second)
            ORDER BY user_id
            FOR UPDATE
        ");
        $stmt->execute([':first' => $firstId, ':second' => $secondId]);
        $walletRows = $stmt->fetchAll(\PDO::FETCH_ASSOC);

        $wallets = [];
        foreach ($walletRows as $row) {
            $wallets[(int) $row['user_id']] = (float) $row['balance'];
        }

        if (!isset($wallets[$buyerId]) || !isset($wallets[$sellerId])) {
            $this->db->rollBack();
            return ['success' => false, 'message' => 'Wallet not found.'];
        }

        // --- 4. Verify buyer has sufficient balance ---
        if ($wallets[$buyerId] < $price) {
            $this->db->rollBack();
            return ['success' => false, 'message' => 'Insufficient balance.'];
        }

        // --- 5. Debit buyer, credit seller ---
        $txRef = 'TXN-' . strtoupper(bin2hex(random_bytes(8)));

        $this->wallet->debit(
            $buyerId, $price, 'purchase:' . $listing['asset_name'], $txRef,
            $wallets[$buyerId]
        );
        $this->wallet->credit(
            $sellerId, $price, 'sale:' . $listing['asset_name'], $txRef,
            $wallets[$sellerId]
        );

        // --- 6. Transfer inventory ownership ---
        $stmt = $this->db->prepare("
            DELETE FROM inventory
            WHERE user_id = :sellerId AND asset_id = :assetId
            LIMIT 1
        ");
        $stmt->execute([':sellerId' => $sellerId, ':assetId' => $assetId]);

        $stmt = $this->db->prepare("
            INSERT INTO inventory (user_id, asset_id) VALUES (:buyerId, :assetId)
        ");
        $stmt->execute([':buyerId' => $buyerId, ':assetId' => $assetId]);

        // --- 7. Mark listing as sold ---
        $this->listings->updateStatus($listingId, 'sold');

        // --- 8. Write transaction record ---
        $stmt = $this->db->prepare("
            INSERT INTO transactions (listing_id, buyer_id, seller_id, asset_id, price)
            VALUES (:listingId, :buyerId, :sellerId, :assetId, :price)
        ");
        $stmt->execute([
            ':listingId' => $listingId,
            ':buyerId'   => $buyerId,
            ':sellerId'  => $sellerId,
            ':assetId'   => $assetId,
            ':price'     => $price,
        ]);

        $this->db->commit();

        return [
            'success'       => true,
            'message'       => 'Purchase successful.',
            'transactionRef' => $txRef,
            'assetName'     => $listing['asset_name'],
            'price'         => $price,
        ];

    } catch (\PDOException $e) {
        if ($this->db->inTransaction()) {
            $this->db->rollBack();
        }
        error_log('MarketService::executePurchase error: ' . $e->getMessage());
        return ['success' => false, 'message' => 'Transaction failed. Please try again.'];
    }
    }

    /**
     * Task 3a — Single listing detail for the listing detail page.
     * Returns shaped response ready for ListingDetail.jsx.
     */
    public function findListingById(int $listingId): array|false
    {
        $row = $this->listings->findById($listingId);
        if (!$row) {
            return false;
        }

        return [
            'id'     => (int)    $row['id'],
            'price'  => (float)  $row['price'],
            'status' => $row['status'],
            'listedAt' => $row['created_at'],
            'asset'  => [
                'id'          => (int)  $row['asset_id'],
                'name'        => $row['asset_name'],
                'rarity'      => $row['rarity'],
                'condition'   => $row['condition_state'],
                'imageUrl'    => $row['image_url'],
                'description' => $row['asset_description'] ?? '',
                'collection'  => $row['asset_collection']  ?? '',
            ],
            'seller' => [
                'username' => $row['seller_username'],
            ],
        ];
    }


}