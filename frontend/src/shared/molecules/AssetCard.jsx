/**
 * AssetCard.jsx — Vapour FT Molecule
 * LEAD ONLY — shared molecule, do not modify without Frontend Lead approval.
 *
 * The main TCG listing card. Composed from atoms: Card, Badge (RarityBadge, ConditionBadge), Button.
 * Used on: Home page featured section, /listings grid, /dashboard, /profile.
 *
 * Usage:
 *   <AssetCard asset={asset} onAddToCart={fn} />
 *   <AssetCard asset={asset} onAddToCart={fn} compact />
 */

import Card from '../atoms/Card.jsx';
import Button from '../atoms/Button.jsx';
import { RarityBadge, ConditionBadge } from '../atoms/Badge.jsx';

/* Cart icon for the Add button */
const CartIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} aria-hidden="true">
    <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
    <line x1="3" y1="6" x2="21" y2="6"/>
    <path d="M16 10a4 4 0 0 1-8 0"/>
  </svg>
);

/* Placeholder image when imageUrl is null */
function AssetImagePlaceholder() {
  return (
    <div
      className="
        w-full aspect-square
        bg-(--color-surface-2)
        rounded-md
        flex items-center justify-center
        border border-(--color-border)
      "
      aria-hidden="true"
    >
      <svg className="w-12 h-12 text-(--color-text-muted)" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1}>
        <rect x="2" y="2" width="20" height="20" rx="2"/>
        <path d="m8 8 8 8M8 16l8-8" strokeWidth={0.8}/>
        <rect x="7" y="7" width="10" height="10" rx="1" strokeDasharray="2 2" strokeWidth={0.8}/>
      </svg>
    </div>
  );
}

/**
 * @param {object} asset         - from mockAssets or API response
 * @param {function} onAddToCart - called with asset.id
 * @param {boolean} compact      - reduced padding for grid views
 * @param {boolean} showSeller   - show seller username below collection
 */
export default function AssetCard({ asset, onAddToCart, compact = false, showSeller = false }) {
  const {
    id, name, rarity, condition, collection, imageUrl, price, seller
  } = asset;

  const formattedPrice = new Intl.NumberFormat('en-US', {
    style: 'currency', currency: 'USD',
  }).format(price);

  return (
    <Card
      variant="default"
      padding={compact ? 'sm' : 'md'}
      glow
      className="flex flex-col gap-3"
    >
      {/* Asset image */}
      <div className="overflow-hidden rounded-md">
        {imageUrl
          ? (
            <img
              src={imageUrl}
              alt={name}
              className="w-full aspect-square object-cover transition-transform duration-(--transition-slow)] hover:scale-105"
              loading="lazy"
            />
          )
          : <AssetImagePlaceholder />
        }
      </div>

      {/* Details */}
      <div className="flex flex-col gap-2">
        <h3 className="text-sm font-bold text-(--color-text-primary) leading-snug line-clamp-2">
          {name}
        </h3>

        {/* Badges row */}
        <div className="flex flex-wrap gap-1.5">
          <RarityBadge tier={rarity} size={compact ? 'sm' : 'md'} />
          <ConditionBadge condition={condition} size={compact ? 'sm' : 'md'} />
        </div>

        {/* Collection + optional seller */}
        <p className="text-xs text-(--color-text-muted) leading-tight">
          {collection}
          {showSeller && seller && (
            <span className="ml-1 text-(--color-text-muted)">· {seller.username}</span>
          )}
        </p>
      </div>

      {/* Price + CTA */}
      <div className="flex items-center justify-between mt-auto pt-1">
        <div>
          <p className="text-[10px] text-(--color-text-muted) uppercase tracking-wide">Price</p>
          <p className="text-base font-bold text-(--color-text-primary)">{formattedPrice}</p>
        </div>
        <Button
          variant="primary"
          size={compact ? 'sm' : 'md'}
          icon={<CartIcon />}
          onClick={() => onAddToCart?.(id)}
          aria-label={`Add ${name} to cart`}
        >
          Add
        </Button>
      </div>
    </Card>
  );
}
