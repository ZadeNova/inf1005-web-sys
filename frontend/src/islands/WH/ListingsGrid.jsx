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

import { useState, useMemo } from 'react';
import AssetCard from '../../shared/molecules/AssetCard.jsx';
import Skeleton  from '../../shared/atoms/Skeleton.jsx';
import Button    from '../../shared/atoms/Button.jsx';
import { useApi }          from '../../shared/hooks/useApi.js';
import { mockAssets, RARITY, CONDITION, USE_MOCK } from '../../shared/mockAssets.js';

export default function ListingsGrid() {
  const [cart, setCart]           = useState([]);
  const [search, setSearch]       = useState('');
  const [rarity, setRarity]       = useState('');
  const [condition, setCondition] = useState('');
  const [sort, setSort]           = useState('');
  const [view, setView]           = useState('grid');
  const [page, setPage]           = useState(1);
  const [maxPrice, setMaxPrice]   = useState(5000);
  const PER_PAGE = 4;

  const { data, loading, error } = useApi(
    USE_MOCK ? null : '/api/v1/listings',
    { auto: !USE_MOCK }
  );

  const allAssets = USE_MOCK ? mockAssets : (data?.listings ?? []);

  const absoluteMax = useMemo(() =>
    Math.ceil(Math.max(...allAssets.map(a => a.price))),
    [allAssets]
  );

  const filtered = allAssets.filter(a => {
    if (search && !a.name.toLowerCase().includes(search.toLowerCase())) return false;
    if (rarity && a.rarity !== rarity) return false;
    if (condition && a.condition !== condition) return false;
    if (a.price > maxPrice) return false;
    return true;
  });

  const sorted = [...filtered].sort((a, b) => {
    if (sort === 'low')  return a.price - b.price;
    if (sort === 'high') return b.price - a.price;
    return 0;
  });

  const totalPages = Math.ceil(sorted.length / PER_PAGE);
  const assets     = sorted.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  function handleAddToCart(assetId) {
    setCart(prev => [...new Set([...prev, assetId])]);
  }

  function handleClearFilters() {
    setSearch('');
    setRarity('');
    setCondition('');
    setSort('');
    setMaxPrice(absoluteMax);
    setPage(1);
  }

  const hasActiveFilters = search || rarity || condition || sort || maxPrice < absoluteMax;

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

  return (
    <div className="flex flex-col gap-6">

      <div className="flex flex-col gap-3">

        {/* Row 1 — Search bar */}
        <input
          type="search"
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(1); }}
          placeholder="Search listings..."
          className="bg-(--color-surface-2) border border-(--color-border)
                     text-(--color-text-primary) text-sm rounded-md px-3 py-2 w-full"
          aria-label="Search listings"
        />

        {/* Row 2 — filters + view toggle */}
        <div className="flex flex-wrap gap-3 items-center justify-between">

          <div className="flex flex-wrap gap-3 items-center">

            <select
              value={rarity}
              onChange={e => { setRarity(e.target.value); setPage(1); }}
              className="bg-(--color-surface-2) border border-(--color-border)
                         text-(--color-text-primary) text-sm rounded-md px-3 py-2"
              aria-label="Filter by rarity"
            >
              <option value="">All Rarities</option>
              {Object.values(RARITY).map(r => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>

            <select
              value={condition}
              onChange={e => { setCondition(e.target.value); setPage(1); }}
              className="bg-(--color-surface-2) border border-(--color-border)
                         text-(--color-text-primary) text-sm rounded-md px-3 py-2"
              aria-label="Filter by condition"
            >
              <option value="">All Conditions</option>
              {Object.values(CONDITION).map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>

            <select
              value={sort}
              onChange={e => { setSort(e.target.value); setPage(1); }}
              className="bg-(--color-surface-2) border border-(--color-border)
                         text-(--color-text-primary) text-sm rounded-md px-3 py-2"
              aria-label="Sort by price"
            >
              <option value="">Default</option>
              <option value="low">Price: Low to High</option>
              <option value="high">Price: High to Low</option>
            </select>

            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearFilters}
              >
                Clear filters
              </Button>
            )}
          </div>

          <div className="flex items-center gap-3">
            <span className="text-sm text-(--color-text-muted)">
              {sorted.length} listing{sorted.length !== 1 ? 's' : ''}
            </span>
            <div className="flex gap-1 border border-(--color-border) rounded-md p-0.5">
              <button
                type="button"
                onClick={() => setView('grid')}
                aria-label="Grid view"
                className={`px-2.5 py-1 rounded text-xs font-semibold transition-colors
                  ${view === 'grid'
                    ? 'bg-(--color-accent) text-white'
                    : 'text-(--color-text-muted) hover:text-(--color-text-primary)'
                  }`}
              >
                Grid
              </button>
              <button
                type="button"
                onClick={() => setView('list')}
                aria-label="List view"
                className={`px-2.5 py-1 rounded text-xs font-semibold transition-colors
                  ${view === 'list'
                    ? 'bg-(--color-accent) text-white'
                    : 'text-(--color-text-muted) hover:text-(--color-text-primary)'
                  }`}
              >
                List
              </button>
            </div>
          </div>
        </div>

        {/* Row 3 — Price range slider */}
        <div className="flex items-center gap-3">
          <label
            htmlFor="price-range"
            className="text-sm text-(--color-text-muted) shrink-0"
          >
            Max Price:
          </label>
          <input
            id="price-range"
            type="range"
            min={0}
            max={absoluteMax}
            step={10}
            value={maxPrice}
            onChange={e => { setMaxPrice(Number(e.target.value)); setPage(1); }}
            className="w-48 accent-(--color-accent)"
            aria-label={`Maximum price: $${maxPrice}`}
          />
          <span className="text-sm font-semibold text-(--color-text-primary) w-20">
            Up to ${maxPrice.toLocaleString()}
          </span>
        </div>

      </div>

      {assets.length === 0 && (
        <p className="text-center text-(--color-text-muted) py-16 text-sm">
          No listings found matching your filters.
        </p>
      )}

      {view === 'grid' && assets.length > 0 && (
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
      )}

      {view === 'list' && assets.length > 0 && (
        <div className="flex flex-col gap-3">
          {assets.map(asset => (
            <div
              key={asset.id}
              className="flex items-center gap-4 p-4 rounded-lg
                         bg-(--color-surface) border border-(--color-border)"
            >
              <div className="w-16 h-16 rounded-md bg-(--color-surface-2)
                              border border-(--color-border) shrink-0
                              flex items-center justify-center">
                <span className="text-xs text-(--color-text-muted)">IMG</span>
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-(--color-text-primary) truncate">
                  {asset.name}
                </p>
                <p className="text-xs text-(--color-text-muted)">
                  {asset.collection} · {asset.rarity}
                </p>
                <p className="text-xs text-(--color-text-muted)">
                  {asset.condition}
                </p>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <p className="text-sm font-bold text-(--color-text-primary)">
                  ${asset.price.toLocaleString()}
                </p>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => handleAddToCart(asset.id)}
                  aria-label={`Add ${asset.name} to cart`}
                >
                  Add
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 pt-4">
          <Button
            variant="secondary"
            size="sm"
            disabled={page === 1}
            onClick={() => setPage(p => p - 1)}
            aria-label="Previous page"
          >
            ← Prev
          </Button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
            <button
              key={p}
              type="button"
              onClick={() => setPage(p)}
              aria-label={`Page ${p}`}
              aria-current={page === p ? 'page' : undefined}
              className={`w-8 h-8 rounded text-sm font-semibold transition-colors
                ${page === p
                  ? 'bg-(--color-accent) text-white'
                  : 'text-(--color-text-muted) hover:text-(--color-text-primary) hover:bg-(--color-surface-2)'
                }`}
            >
              {p}
            </button>
          ))}
          <Button
            variant="secondary"
            size="sm"
            disabled={page === totalPages}
            onClick={() => setPage(p => p + 1)}
            aria-label="Next page"
          >
            Next →
          </Button>
        </div>
      )}

    </div>
  );
}