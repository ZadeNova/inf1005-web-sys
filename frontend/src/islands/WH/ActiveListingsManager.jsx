/**
 * ActiveListingsManager.jsx — Dev 2 Island
 * Owner: WH (Dev 2)
 * Mounts via: mountIsland('active-listings-manager-root', ActiveListingsManager)
 * PHP view: backend/src/Views/dashboard.php
 *
 * FIX: handleCancel now calls DELETE /api/v1/market/listings/:id
 */

import { useState, useMemo, useRef, useEffect } from 'react';
import Card      from '../../shared/atoms/Card.jsx';
import Button    from '../../shared/atoms/Button.jsx';
import Skeleton  from '../../shared/atoms/Skeleton.jsx';
import { RarityBadge } from '../../shared/atoms/Badge.jsx';
import { useApi }               from '../../shared/hooks/useApi.js';
import { mockAssets, USE_MOCK } from '../../shared/mockAssets.js';

const MOCK_LISTINGS = [
  { id: 'lst-001', asset: mockAssets[0], listedAt: '2025-03-01' },
  { id: 'lst-002', asset: mockAssets[2], listedAt: '2025-03-08' },
  { id: 'lst-003', asset: mockAssets[4], listedAt: '2025-03-11' },
];
const MOCK_STATS = { totalSales: 142, itemsOwned: 37 };

const PlusIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
       strokeWidth={2} className="w-5 h-5" aria-hidden="true">
    <line x1="12" y1="5" x2="12" y2="19"/>
    <line x1="5"  y1="12" x2="19" y2="12"/>
  </svg>
);

const XIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
       strokeWidth={2} className="w-4 h-4" aria-hidden="true">
    <line x1="18" y1="6" x2="6" y2="18"/>
    <line x1="6"  y1="6" x2="18" y2="18"/>
  </svg>
);

export default function ActiveListingsManager() {
  const { data, loading, error } = useApi(
    USE_MOCK ? null : '/api/v1/market/listings/mine',
    { auto: !USE_MOCK }
  );

  const rawListings = USE_MOCK ? MOCK_LISTINGS : (data?.listings ?? []);
  const stats       = USE_MOCK ? MOCK_STATS    : (data?.stats    ?? {});

  const [cancelledIds,    setCancelledIds]    = useState([]);
  const [cancellingId,    setCancellingId]    = useState(null); // tracks in-flight cancel
  const [cancelError,     setCancelError]     = useState(null);
  const [addedIds,        setAddedIds]        = useState([]);
  const [showAddListing,  setShowAddListing]  = useState(false);
  const [listSearch,      setListSearch]      = useState('');
  const searchRef = useRef(null);

  useEffect(() => {
    if (!showAddListing) return;
    function handler(e) {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowAddListing(false);
        setListSearch('');
      }
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [showAddListing]);

  const activeListings = rawListings.filter(l =>
    !cancelledIds.includes(l.id) || addedIds.includes(l.id)
  );

  const searchResults = useMemo(() =>
    rawListings.filter(l =>
      cancelledIds.includes(l.id) &&
      !addedIds.includes(l.id) &&
      (listSearch === '' ||
        l.asset.name.toLowerCase().includes(listSearch.toLowerCase()))
    ), [listSearch, cancelledIds, addedIds, rawListings]
  );

  // FIX: now calls DELETE /api/v1/market/listings/:id
  async function handleCancel(id) {
    setCancelError(null);

    if (USE_MOCK) {
      setCancelledIds(prev => [...prev, id]);
      setAddedIds(prev => prev.filter(i => i !== id));
      return;
    }

    setCancellingId(id);
    try {
      const csrf = document.querySelector('meta[name="csrf-token"]')?.content ?? '';
      const res  = await fetch(`/api/v1/market/listings/${id}`, {
        method:  'DELETE',
        headers: { 'X-CSRF-Token': csrf },
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ message: 'Failed to cancel listing.' }));
        setCancelError(err.message ?? 'Failed to cancel listing.');
        return;
      }

      // Only update UI after confirmed server cancel
      setCancelledIds(prev => [...prev, id]);
      setAddedIds(prev => prev.filter(i => i !== id));
    } catch (err) {
      setCancelError('Network error. Please try again.');
    } finally {
      setCancellingId(null);
    }
  }

  function handleAddListing(listing) {
    setAddedIds(prev => [...prev, listing.id]);
    setCancelledIds(prev => prev.filter(i => i !== listing.id));
    setListSearch('');
    setShowAddListing(false);
  }

  if (loading) {
    return (
      <div className="flex flex-col gap-3" role="status" aria-label="Loading listings">
        {[1, 2, 3].map(i => (
          <div key={i} className="flex items-center gap-4 p-4 rounded-lg
                                   border border-(--color-border) bg-(--color-surface) animate-pulse">
            <div className="w-14 h-14 rounded-md bg-(--color-surface-2) shrink-0"/>
            <div className="flex-1 flex flex-col gap-2">
              <div className="h-4 w-40 rounded bg-(--color-surface-2)"/>
              <div className="h-3 w-20 rounded bg-(--color-surface-2)"/>
            </div>
            <div className="h-8 w-20 rounded-full bg-(--color-surface-2)"/>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <p role="alert" className="text-sm text-(--color-danger)">
        Failed to load listings: {error}
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-4">

      {/* Cancel error banner */}
      {cancelError && (
        <p role="alert" aria-live="assertive"
           className="text-sm text-(--color-danger) bg-(--color-danger-subtle)
                      border border-(--color-danger) rounded-md px-3 py-2">
          {cancelError}
        </p>
      )}

      {/* Section header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h2 className="text-base font-bold text-(--color-text-primary)">
          My Listings
        </h2>

        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-3 text-sm">
            <span>
              <span className="font-bold text-(--color-text-primary)">
                {activeListings.length}
              </span>
              <span className="text-(--color-text-muted) ml-1">active</span>
            </span>
            <span>
              <span className="font-bold text-(--color-text-primary)">
                {stats.totalSales ?? '—'}
              </span>
              <span className="text-(--color-text-muted) ml-1">total sales</span>
            </span>
            <span>
              <span className="font-bold text-(--color-text-primary)">
                {stats.itemsOwned ?? '—'}
              </span>
              <span className="text-(--color-text-muted) ml-1">owned</span>
            </span>
          </div>

          <Button
            variant="secondary"
            size="sm"
            icon={showAddListing ? <XIcon /> : <PlusIcon />}
            onClick={() => {
              setShowAddListing(v => !v);
              setListSearch('');
            }}
            aria-expanded={showAddListing}
            aria-controls="add-listing-panel"
          >
            {showAddListing ? 'Close' : 'Add Listing'}
          </Button>
        </div>
      </div>

      {/* Add listing search panel */}
      {showAddListing && (
        <div id="add-listing-panel"
             ref={searchRef}
             className="relative flex flex-col gap-2 p-4 rounded-lg
                        border border-(--color-border) bg-(--color-surface)">
          <label htmlFor="listing-search"
                 className="text-xs text-(--color-text-muted) font-semibold">
            Search your assets to list:
          </label>
          <input
            id="listing-search"
            type="search"
            value={listSearch}
            onChange={e => setListSearch(e.target.value)}
            placeholder="Search by name..."
            className="bg-(--color-surface-2) border border-(--color-border)
                       text-(--color-text-primary) text-sm rounded-md px-3 py-2 w-full"
            aria-autocomplete="list"
            aria-controls="listing-search-results"
          />

          {searchResults.length > 0 && (
            <ul id="listing-search-results"
                role="listbox"
                className="flex flex-col gap-1 max-h-52 overflow-y-auto mt-1">
              {searchResults.map(listing => (
                <li key={listing.id} role="option" aria-selected="false">
                  <button
                    type="button"
                    onClick={() => handleAddListing(listing)}
                    className="w-full flex items-center gap-3 px-3 py-2 text-left
                               rounded-md hover:bg-(--color-surface-2) transition-colors"
                  >
                    <div className="w-8 h-8 rounded bg-(--color-surface-2)
                                    border border-(--color-border)
                                    flex items-center justify-center shrink-0">
                      <span className="text-[10px] text-(--color-text-muted)">IMG</span>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-(--color-text-primary)">
                        {listing.asset.name}
                      </p>
                      <p className="text-xs text-(--color-text-muted)">
                        {listing.asset.rarity} · ${listing.asset.price.toLocaleString()}
                      </p>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          )}

          {searchResults.length === 0 && (
            <p className="text-xs text-(--color-text-muted) px-1">
              {cancelledIds.length === 0
                ? 'No cancelled listings to re-add.'
                : 'No results found.'}
            </p>
          )}
        </div>
      )}

      {/* Empty state */}
      {activeListings.length === 0 && (
        <button
          type="button"
          onClick={() => setShowAddListing(true)}
          className="w-full border-2 border-dashed border-(--color-border)
                     rounded-lg py-10 flex flex-col items-center gap-2
                     hover:border-(--color-accent) transition-colors group"
          aria-label="No active listings — click to add one"
        >
          <span className="w-10 h-10 rounded-full bg-(--color-surface-2)
                           group-hover:bg-(--color-accent)
                           flex items-center justify-center text-xl
                           text-(--color-text-muted) group-hover:text-white
                           transition-colors"
                aria-hidden="true">
            +
          </span>
          <p className="text-sm text-(--color-text-muted)
                        group-hover:text-(--color-accent) transition-colors">
            No active listings — click here to add one!
          </p>
        </button>
      )}

      {/* Listings list */}
      {activeListings.length > 0 && (
        <div className="flex flex-col gap-3">
          {activeListings.map(listing => (
            <Card key={listing.id} variant="default" padding="md"
                  className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-md bg-(--color-surface-2)
                              border border-(--color-border) shrink-0
                              flex items-center justify-center"
                   aria-hidden="true">
                <span className="text-xs text-(--color-text-muted)">IMG</span>
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-(--color-text-primary) truncate">
                  {listing.asset.name}
                </p>
                <div className="flex gap-1 mt-1">
                  <RarityBadge tier={listing.asset.rarity} size="sm" />
                </div>
                <p className="text-xs text-(--color-text-muted) mt-1">
                  Listed{' '}
                  {new Date(listing.listedAt).toLocaleDateString('en-US', {
                    month: 'short',
                    day:   'numeric',
                  })}
                </p>
              </div>

              <div className="flex flex-col items-end gap-2 shrink-0">
                <p className="text-sm font-bold text-(--color-text-primary)">
                  ${listing.asset.price.toLocaleString()}
                </p>
                <Button
                  variant="danger"
                  size="sm"
                  loading={cancellingId === listing.id}
                  onClick={() => handleCancel(listing.id)}
                  className="rounded-full"
                  aria-label={`Cancel listing for ${listing.asset.name}`}
                >
                  Cancel
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

    </div>
  );
}