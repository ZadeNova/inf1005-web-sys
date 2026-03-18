/**
 * ListingsGrid.jsx — Dev 2 Island (PATCHED)
 * Owner: WH (Dev 2)
 * Mounts via: mountIsland('listings-grid-root', ListingsGrid)
 * PHP view: backend/src/Views/listings.php
 *
 * Changes from original:
 *   1. Sort option values corrected: low/high → price_asc/price_desc/newest
 *      (must match what ListingRepository::findActive expects)
 *   2. handleAddToCart replaced with real buy flow via BuyModal
 *   3. Wallet balance fetched so modal can show balance before confirm
 *
 * API endpoints (when USE_MOCK = false):
 *   GET  /api/v1/market/listings?search=&rarity=&condition=&sort=&page=
 *   GET  /api/v1/user/wallet   (for balance display in modal — skipped if not logged in)
 *   POST /api/v1/market/buy    (handled inside BuyModal)
 */

import { useState, useMemo, useRef, useEffect } from 'react';
import AssetCard    from '../../shared/molecules/AssetCard.jsx';
import Skeleton     from '../../shared/atoms/Skeleton.jsx';
import Button       from '../../shared/atoms/Button.jsx';
import BuyModal     from './BuyModal.jsx';
import { useApi }   from '../../shared/hooks/useApi.js';
import { mockAssets, RARITY, CONDITION, USE_MOCK } from '../../shared/mockAssets.js';

/* ── Highlight helper ─────────────────────────────────────────────────── */
function highlight(text, query) {
  if (!query) return text;
  const idx = text.toLowerCase().indexOf(query.toLowerCase());
  if (idx === -1) return text;
  return (
    <>
      {text.slice(0, idx)}
      <strong className="text-(--color-accent)">
        {text.slice(idx, idx + query.length)}
      </strong>
      {text.slice(idx + query.length)}
    </>
  );
}

/* ════════════════════════════════════════════════════════════════════════
   MAIN EXPORT
   ════════════════════════════════════════════════════════════════════════ */
export default function ListingsGrid({ userId }) {
  /* ── Filter / UI state ─────────────────────────────────────────── */
  const [query,        setQuery]        = useState('');
  const [search,       setSearch]       = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [rarity,       setRarity]       = useState('');
  const [condition,    setCondition]    = useState('');
  const [sort,         setSort]         = useState('newest');   // FIX: was 'low'
  const [view,         setView]         = useState('grid');
  const [page,         setPage]         = useState(1);
  const [maxPrice,     setMaxPrice]     = useState(99999);
  const [buyTarget,    setBuyTarget]    = useState(null);  // listing being purchased
  const PER_PAGE  = 4;
  const searchRef = useRef(null);

  /* ── Data fetching ─────────────────────────────────────────────── */
  const listingsUrl = USE_MOCK
    ? null
    : `/api/v1/market/listings?search=${encodeURIComponent(search)}&rarity=${rarity}&condition=${condition}&sort=${sort}&page=${page}`;

  const { data, loading, error } = useApi(
    listingsUrl,
    { auto: !USE_MOCK }
  );

  /* Wallet balance — only attempt if logged in (userId prop set) */
  const { data: walletData } = useApi(
    USE_MOCK || !userId ? null : '/api/v1/user/wallet',
    { auto: !USE_MOCK && !!userId }
  );
  const walletBalance = USE_MOCK
    ? 2847.00
    : (walletData?.wallet?.balance ?? null);

  const allAssets = USE_MOCK ? mockAssets : (data?.listings ?? []);

  const absoluteMax = useMemo(() =>
    allAssets.length > 0 ? Math.ceil(Math.max(...allAssets.map(a => a.price))) : 99999,
    [allAssets]
  );

  /* ── Search autocomplete suggestions ──────────────────────────── */
  const suggestions = useMemo(() => {
    if (!query.trim()) return [];
    return allAssets
      .filter(a => a.name.toLowerCase().includes(query.toLowerCase()))
      .slice(0, 6);
  }, [query, allAssets]);

  /* Close dropdown on outside click */
  useEffect(() => {
    function handler(e) {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  /* ── Client-side filter + sort (mock mode only) ────────────────── */
  const filtered = allAssets.filter(a => {
    if (search    && !a.name.toLowerCase().includes(search.toLowerCase())) return false;
    if (rarity    && a.rarity    !== rarity)    return false;
    if (condition && a.condition !== condition) return false;
    if (a.price > maxPrice) return false;
    return true;
  });

  const sorted = [...filtered].sort((a, b) => {
    if (sort === 'price_asc')  return a.price - b.price;  // FIX: was 'low'
    if (sort === 'price_desc') return b.price - a.price;  // FIX: was 'high'
    return new Date(b.listedAt ?? 0) - new Date(a.listedAt ?? 0); // newest
  });

  const totalPages = Math.ceil(sorted.length / PER_PAGE);
  const assets     = sorted.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  /* ── Handlers ──────────────────────────────────────────────────── */
  function handleBuy(assetId) {
    const listing = allAssets.find(a => a.id === assetId);
    if (listing) setBuyTarget(listing);
  }

  function handleSelectSuggestion(name) {
    setQuery(name);
    setSearch(name);
    setShowDropdown(false);
    setPage(1);
  }

  function handleSearchSubmit(e) {
    e.preventDefault();
    setSearch(query);
    setShowDropdown(false);
    setPage(1);
  }

  function handleClearFilters() {
    setQuery('');
    setSearch('');
    setRarity('');
    setCondition('');
    setSort('newest');
    setMaxPrice(absoluteMax);
    setPage(1);
  }

  const hasActiveFilters = search || rarity || condition
    || sort !== 'newest'
    || maxPrice < absoluteMax;

  /* ── Loading ─────────────────────────────────────────────────────── */
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5"
           role="status" aria-label="Loading listings">
        {Array.from({ length: 8 }, (_, i) => (
          <Skeleton key={i} variant="card" label="Loading asset listing" />
        ))}
      </div>
    );
  }

  /* ── Error ───────────────────────────────────────────────────────── */
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

  /* ── Render ──────────────────────────────────────────────────────── */
  return (
    <>
      <div className="flex flex-col gap-6">

        {/* ── Search bar ─────────────────────────────────────────── */}
        <div className="flex flex-col gap-3">
          <form onSubmit={handleSearchSubmit} ref={searchRef} className="relative">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <input
                  type="search"
                  value={query}
                  onChange={e => {
                    setQuery(e.target.value);
                    setShowDropdown(true);
                    if (!e.target.value) { setSearch(''); setPage(1); }
                  }}
                  onFocus={() => query && setShowDropdown(true)}
                  placeholder="Search listings..."
                  className="bg-(--color-surface-2) border border-(--color-border)
                             text-(--color-text-primary) text-sm rounded-full
                             px-4 py-2 w-full"
                  aria-label="Search listings"
                  aria-autocomplete="list"
                  aria-expanded={showDropdown && suggestions.length > 0}
                />
                {showDropdown && suggestions.length > 0 && (
                  <ul role="listbox"
                      className="absolute top-full left-0 right-0 z-50 mt-1
                                 bg-(--color-surface) border border-(--color-border)
                                 rounded-md shadow-lg overflow-hidden">
                    {suggestions.map(asset => (
                      <li key={asset.id}
                          role="option"
                          aria-selected="false"
                          onMouseDown={() => handleSelectSuggestion(asset.name)}
                          className="px-3 py-2 text-sm text-(--color-text-primary)
                                     hover:bg-(--color-surface-2) cursor-pointer
                                     flex items-center justify-between gap-2">
                        <span>{highlight(asset.name, query)}</span>
                        <span className="text-xs text-(--color-text-muted) shrink-0">
                          {asset.rarity}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <Button variant="primary" size="md" type="submit"
                      aria-label="Submit search" className="rounded-full">
                Search
              </Button>
            </div>
            {search && (
              <p className="text-sm text-(--color-text-muted) mt-2">
                {sorted.length} result{sorted.length !== 1 ? 's' : ''} for{' '}
                <span className="font-semibold text-(--color-text-primary)">
                  "{search}"
                </span>
              </p>
            )}
          </form>

          {/* ── Filter row ─────────────────────────────────────── */}
          <div className="flex flex-wrap gap-3 items-center justify-between">
            <div className="flex flex-wrap gap-3 items-center">

              <select value={rarity}
                      onChange={e => { setRarity(e.target.value); setPage(1); }}
                      className="bg-(--color-surface-2) border border-(--color-border)
                                 text-(--color-text-primary) text-sm rounded-md px-3 py-2"
                      aria-label="Filter by rarity">
                <option value="">All Rarities</option>
                {Object.values(RARITY).map(r => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>

              <select value={condition}
                      onChange={e => { setCondition(e.target.value); setPage(1); }}
                      className="bg-(--color-surface-2) border border-(--color-border)
                                 text-(--color-text-primary) text-sm rounded-md px-3 py-2"
                      aria-label="Filter by condition">
                <option value="">All Conditions</option>
                {Object.values(CONDITION).map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>

              {/* FIX: corrected sort values to match backend */}
              <select value={sort}
                      onChange={e => { setSort(e.target.value); setPage(1); }}
                      className="bg-(--color-surface-2) border border-(--color-border)
                                 text-(--color-text-primary) text-sm rounded-md px-3 py-2"
                      aria-label="Sort listings">
                <option value="newest">Newest</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
              </select>

              {hasActiveFilters && (
                <Button variant="ghost" size="sm" onClick={handleClearFilters}>
                  Clear filters
                </Button>
              )}
            </div>

            {/* Grid / list toggle */}
            <div className="flex items-center gap-3">
              {!search && (
                <span className="text-sm text-(--color-text-muted)">
                  {sorted.length} listing{sorted.length !== 1 ? 's' : ''}
                </span>
              )}
              <div className="flex gap-1 border border-(--color-border) rounded-md p-0.5">
                <button type="button" onClick={() => setView('grid')}
                        aria-label="Grid view"
                        aria-pressed={view === 'grid'}
                        className={`px-2.5 py-1 rounded text-xs font-semibold transition-colors
                          ${view === 'grid'
                            ? 'bg-(--color-accent) text-white'
                            : 'text-(--color-text-muted) hover:text-(--color-text-primary)'}`}>
                  Grid
                </button>
                <button type="button" onClick={() => setView('list')}
                        aria-label="List view"
                        aria-pressed={view === 'list'}
                        className={`px-2.5 py-1 rounded text-xs font-semibold transition-colors
                          ${view === 'list'
                            ? 'bg-(--color-accent) text-white'
                            : 'text-(--color-text-muted) hover:text-(--color-text-primary)'}`}>
                  List
                </button>
              </div>
            </div>
          </div>

          {/* Price range slider */}
          <div className="flex items-center gap-3">
            <label htmlFor="price-range"
                   className="text-sm text-(--color-text-muted) shrink-0">
              Max Price:
            </label>
            <input id="price-range"
                   type="range"
                   min={0}
                   max={absoluteMax}
                   step={10}
                   value={maxPrice}
                   onChange={e => { setMaxPrice(Number(e.target.value)); setPage(1); }}
                   className="w-48 accent-(--color-accent)"
                   aria-label={`Maximum price: $${maxPrice}`} />
            <span className="text-sm font-semibold text-(--color-text-primary) w-28">
              Up to ${maxPrice.toLocaleString()}
            </span>
          </div>
        </div>

        {/* ── Empty state ─────────────────────────────────────────── */}
        {assets.length === 0 && (
          <p className="text-center text-(--color-text-muted) py-16 text-sm">
            No listings found matching your filters.
          </p>
        )}

        {/* ── Grid view ───────────────────────────────────────────── */}
        {view === 'grid' && assets.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {assets.map(asset => (
              <AssetCard
                key={asset.id}
                asset={asset}
                onAddToCart={handleBuy}   /* FIX: opens BuyModal instead of local state */
                showSeller
              />
            ))}
          </div>
        )}

        {/* ── List view ───────────────────────────────────────────── */}
        {view === 'list' && assets.length > 0 && (
          <div className="flex flex-col gap-3">
            {assets.map(asset => (
              <div key={asset.id}
                   className="flex items-center gap-4 p-4 rounded-lg
                              bg-(--color-surface) border border-(--color-border)">
                <div className="w-16 h-16 rounded-md bg-(--color-surface-2)
                                border border-(--color-border) shrink-0
                                flex items-center justify-center"
                     aria-hidden="true">
                  <span className="text-xs text-(--color-text-muted)">IMG</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-(--color-text-primary) truncate">
                    {highlight(asset.name, search)}
                  </p>
                  <p className="text-xs text-(--color-text-muted)">
                    {asset.collection} · {asset.rarity}
                  </p>
                  <p className="text-xs text-(--color-text-muted)">{asset.condition}</p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <p className="text-sm font-bold text-(--color-text-primary)">
                    ${asset.price.toLocaleString()}
                  </p>
                  <Button variant="primary" size="sm"
                          onClick={() => handleBuy(asset.id)}
                          aria-label={`Buy ${asset.name}`}
                          className="rounded-full">
                    Buy
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── Pagination ──────────────────────────────────────────── */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 pt-4"
               role="navigation" aria-label="Listings pagination">
            <Button variant="secondary" size="sm"
                    disabled={page === 1}
                    onClick={() => setPage(p => p - 1)}
                    aria-label="Previous page">
              ← Prev
            </Button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
              <button key={p} type="button"
                      onClick={() => setPage(p)}
                      aria-label={`Page ${p}`}
                      aria-current={page === p ? 'page' : undefined}
                      className={`w-8 h-8 rounded text-sm font-semibold transition-colors
                        ${page === p
                          ? 'bg-(--color-accent) text-white'
                          : 'text-(--color-text-muted) hover:text-(--color-text-primary) hover:bg-(--color-surface-2)'}`}>
                {p}
              </button>
            ))}
            <Button variant="secondary" size="sm"
                    disabled={page === totalPages}
                    onClick={() => setPage(p => p + 1)}
                    aria-label="Next page">
              Next →
            </Button>
          </div>
        )}

      </div>

      {/* ── Buy modal ───────────────────────────────────────────────── */}
      {buyTarget && (
        <BuyModal
          listing={buyTarget}
          walletBalance={walletBalance}
          onClose={() => setBuyTarget(null)}
          onSuccess={() => setBuyTarget(null)}
        />
      )}
    </>
  );
}