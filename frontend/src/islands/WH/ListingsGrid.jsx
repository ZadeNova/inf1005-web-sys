/**
 * ListingsGrid.jsx — Dev 2 Island
 * Owner: Dev 2
 * Mounts via: mountIsland('listings-grid-root', ListingsGrid)
 * PHP view: backend/src/Views/listing.php → <div id="listings-grid-root" data-props="{}"></div>
 *
 * API endpoint (when USE_MOCK = false):
 *   GET /api/v1/listings?page=1&rarity=&condition=&sort=price_asc
 *   Returns: { listings: [...], pagination: { page, total, perPage } }
 */

import { useState } from 'react';
import AssetCard from '../../shared/molecules/AssetCard.jsx';
import Skeleton  from '../../shared/atoms/Skeleton.jsx';
import Button    from '../../shared/atoms/Button.jsx';
import { useApi }          from '../../shared/hooks/useApi.js';
import { mockAssets, RARITY, CONDITION, USE_MOCK } from '../../shared/mockAssets.js';

export default function ListingsGrid() {
  // TODO Dev 2: add filter state (rarity, condition, sort, search)
  const [cart, setCart] = useState([]);

  const { data, loading, error } = useApi(
    USE_MOCK ? null : '/api/v1/listings',
    { auto: !USE_MOCK }
  );

  const assets = USE_MOCK ? mockAssets : (data?.listings ?? []);

  function handleAddToCart(assetId) {
    setCart(prev => [...new Set([...prev, assetId])]);
    // TODO Dev 2: POST /api/v1/cart/add when backend is live
  }

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5" role="status" aria-label="Loading listings">
        {Array.from({ length: 8 }, (_, i) => (
          <Skeleton key={i} variant="card" label="Loading asset listing" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center gap-4 py-16">
        <p role="alert" className="text-(--color-danger) text-sm">
          Failed to load listings: {error}
        </p>
        <Button variant="secondary" onClick={() => window.location.reload()}>
          Retry
        </Button>
      </div>
    );
  }

  if (assets.length === 0) {
    return (
      <p className="text-center text-(--color-text-muted) py-16 text-sm">
        No listings found matching your filters.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* TODO Dev 2: Add FilterBar component here */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {assets.map(asset => (
          <AssetCard
            key={asset.id}
            asset={asset}
            onAddToCart={handleAddToCart}
            showSeller
          />
        ))}
      </div>
      {/* TODO Dev 2: Add Pagination component here */}
    </div>
  );
}
