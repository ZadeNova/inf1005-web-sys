/**
 * ListingDetail.jsx — WH Island
 * Mounts via: mountIsland('listing-detail-root', ListingDetail)
 * PHP view: backend/src/Views/listing.php
 * Reads listingId from data-listing-id attribute on mount point.
 *
 * API: GET /api/v1/market/listings/{id}
 */

import { useState } from 'react';
import Card    from '../../shared/atoms/Card.jsx';
import Button  from '../../shared/atoms/Button.jsx';
import Skeleton from '../../shared/atoms/Skeleton.jsx';
import { RarityBadge, ConditionBadge } from '../../shared/atoms/Badge.jsx';
import BuyModal from './BuyModal.jsx';
import { useApi } from '../../shared/hooks/useApi.js';

export default function ListingDetail({ listingId }) {
  const [buyTarget, setBuyTarget] = useState(null);

  const { data, loading, error } = useApi(
    listingId ? `/api/v1/market/listings/${listingId}` : null,
    { auto: !!listingId }
  );

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Skeleton variant="block" height={320} label="Loading asset image" />
        <div className="flex flex-col gap-4">
          <Skeleton variant="block" height={28} width="60%" />
          <Skeleton variant="block" height={20} width="40%" />
          <Skeleton variant="block" height={80} />
          <Skeleton variant="block" height={44} width="50%" />
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <p role="alert" className="text-sm text-(--color-danger)">
        Failed to load listing. {error}
      </p>
    );
  }

  const { id, price, status, asset, seller } = data;
  const isActive = status === 'active';

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

        {/* ── Left: image + details ───────────────────────── */}
        <div className="flex flex-col gap-4">
          <div className="w-full aspect-square rounded-lg bg-(--color-surface-2)
                          border border-(--color-border) flex items-center justify-center"
               aria-hidden="true">
            {asset.imageUrl
              ? <img src={asset.imageUrl} alt={asset.name}
                     className="w-full h-full object-cover rounded-lg" />
              : <span className="text-(--color-text-muted) text-sm">No image</span>
            }
          </div>

          <h1 className="text-xl font-bold text-(--color-text-primary)">{asset.name}</h1>

          <div className="flex flex-wrap gap-2">
            <RarityBadge tier={asset.rarity} />
            <ConditionBadge condition={asset.condition} />
          </div>

          {asset.description && (
            <p className="text-sm text-(--color-text-secondary) leading-relaxed">
              {asset.description}
            </p>
          )}

          {asset.collection && (
            <p className="text-xs text-(--color-text-muted)">
              Collection: <span className="text-(--color-text-primary) font-semibold">{asset.collection}</span>
            </p>
          )}
        </div>

        {/* ── Right: price + buy ──────────────────────────── */}
        <Card variant="elevated" padding="lg" className="flex flex-col gap-6 h-fit">
          <div>
            <p className="text-[10px] text-(--color-text-muted) uppercase tracking-widest mb-1">Price</p>
            <p className="text-3xl font-bold text-(--color-text-primary) tabular-nums">
              ${parseFloat(price).toFixed(2)}
            </p>
          </div>

          <div>
            <p className="text-xs text-(--color-text-muted)">Sold by</p>
            <a href={`/profile?user=${seller?.username}`} className="text-sm font-semibold text-(--color-accent) underline underline-offset-2">
              {seller?.username ?? '—'}
            </a>
          </div>

          <div>
            <p className="text-xs text-(--color-text-muted) mb-1">Status</p>
            <span className={`text-xs font-semibold px-2 py-1 rounded-full border ${isActive
                ? 'border-(--color-success) text-(--color-success)'
                : 'border-(--color-border) text-(--color-text-muted)'
              }`}>
              {status}
            </span>
          </div>

          <Button
            variant="primary"
            size="lg"
            disabled={!isActive}
            onClick={() => setBuyTarget({ id, price: parseFloat(price), asset, seller })}
            className="w-full"
          >
            {isActive ? 'Buy Now' : 'Unavailable'}
          </Button>
        </Card>
      </div>

      {buyTarget && (
        <BuyModal
          listing={buyTarget}
          walletBalance={null}
          onClose={() => setBuyTarget(null)}
          onSuccess={() => { setBuyTarget(null); window.location.href = '/listings'; }}
        />
      )}
    </>
  );
}
