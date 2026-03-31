/**
 * AdminListingsManager.jsx — Lead Island
 *
 * FIX (deploy): USE_MOCK is now always false — this island only runs
 * on /admin which is AdminMiddleware protected. No mock path needed.
 * FIX (deploy): csrfToken now read from props (passed via data-props
 * in admin.php) instead of querying the meta tag, which can fail if
 * the meta tag hasn't hydrated yet on the deployed server.
 * FIX (deploy): API response shape corrected — AdminController returns
 * status as lowercase ('active'/'sold'/'cancelled') from the DB ENUM,
 * but the filter comparisons were using uppercase. Normalised to lowercase.
 * FIX (deploy): price is a MySQL DECIMAL which PHP encodes as a string —
 * parseFloat() guard added everywhere price is rendered or compared.
 */

import { useState, useMemo, useEffect } from "react";
import Card from "../../shared/atoms/Card.jsx";
import Button from "../../shared/atoms/Button.jsx";
import Skeleton from "../../shared/atoms/Skeleton.jsx";
import { RarityBadge } from "../../shared/atoms/Badge.jsx";
import { useApi } from "../../shared/hooks/useApi.js";

const PAGE_SIZE = 10;

export default function AdminListingsManager({ csrfToken = '' }) {
  const { data, loading, error, refetch } = useApi(
    "/api/v1/admin/listings",
    { auto: true }
  );

  const [localListings, setLocalListings] = useState([]);
  const [deletingId,    setDeletingId]    = useState(null);
  const [cancellingId,  setCancellingId]  = useState(null);
  const [actionError,   setActionError]   = useState(null);

  const [statusFilter, setStatusFilter] = useState("");
  const [rarityFilter, setRarityFilter] = useState("");
  const [sellerFilter, setSellerFilter] = useState("");
  const [page,         setPage]         = useState(1);

  // Sync local state when API data arrives
  useEffect(() => {
    if (data?.listings) {
      setLocalListings(data.listings);
    }
  }, [data]);

  // Resolve CSRF: prefer prop (injected by PHP), fall back to meta tag
  function getCsrf() {
    return csrfToken
      || document.querySelector('meta[name="csrf-token"]')?.content
      || '';
  }

  // AdminController returns lowercase status from DB ENUM
  const filtered = useMemo(() => {
    setPage(1);
    return localListings.filter((l) => {
      const status = (l.status ?? '').toLowerCase();
      if (statusFilter && status !== statusFilter) return false;
      if (rarityFilter && l.rarity !== rarityFilter) return false;
      if (
        sellerFilter &&
        !(l.seller_username ?? "")
          .toLowerCase()
          .includes(sellerFilter.toLowerCase())
      )
        return false;
      return true;
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [localListings, statusFilter, rarityFilter, sellerFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated  = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  async function handleDelete(id) {
    if (!window.confirm("Permanently remove this listing? This cannot be undone.")) return;
    setDeletingId(id);
    setActionError(null);
    try {
      const res = await fetch(`/api/v1/admin/listings/${id}`, {
        method:  "DELETE",
        headers: { "X-CSRF-Token": getCsrf() },
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message ?? `Server error ${res.status}`);
      }
      // Optimistic removal from local state — no full refetch needed
      setLocalListings((prev) => prev.filter((l) => l.id !== id));
    } catch (err) {
      setActionError(err.message);
    } finally {
      setDeletingId(null);
    }
  }

  async function handleForceCancel(id) {
    setCancellingId(id);
    setActionError(null);
    try {
      const res = await fetch(`/api/v1/admin/listings/${id}`, {
        method:  "PATCH",
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-Token": getCsrf(),
        },
        body: JSON.stringify({ status: "cancelled" }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message ?? `Server error ${res.status}`);
      }
      // Optimistic update
      setLocalListings((prev) =>
        prev.map((l) => (l.id === id ? { ...l, status: "cancelled" } : l))
      );
    } catch (err) {
      setActionError(err.message);
    } finally {
      setCancellingId(null);
    }
  }

  const selectClass =
    "bg-(--color-surface-2) border border-(--color-border) " +
    "text-(--color-text-primary) text-sm rounded-md px-3 py-2";

  if (loading) {
    return (
      <div className="flex flex-col gap-3" role="status" aria-label="Loading listings">
        {Array.from({ length: 4 }, (_, i) => (
          <Skeleton key={i} variant="card" label="Loading listing" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col gap-3">
        <p role="alert" className="text-sm text-(--color-danger)">
          Failed to load listings: {error}
        </p>
        <Button variant="secondary" size="sm" onClick={refetch}>
          Retry
        </Button>
      </div>
    );
  }

  return (
    <>
      {actionError && (
        <p role="alert" aria-live="assertive"
           className="text-sm text-(--color-danger) mb-4
                      bg-(--color-danger-subtle) border border-(--color-danger)
                      rounded-md px-3 py-2">
          {actionError}
        </p>
      )}

      {/* ── Filters ─────────────────────────────────────────────── */}
      <div className="flex flex-wrap gap-3 mb-4">
        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          className={selectClass}
          aria-label="Filter by status"
        >
          <option value="">All Statuses</option>
          <option value="active">Active</option>
          <option value="sold">Sold</option>
          <option value="cancelled">Cancelled</option>
        </select>

        <select
          value={rarityFilter}
          onChange={(e) => { setRarityFilter(e.target.value); setPage(1); }}
          className={selectClass}
          aria-label="Filter by rarity"
        >
          <option value="">All Rarities</option>
          <option value="COMMON">Common</option>
          <option value="UNCOMMON">Uncommon</option>
          <option value="RARE">Rare</option>
          <option value="ULTRA_RARE">Ultra Rare</option>
          <option value="SECRET_RARE">Secret Rare</option>
        </select>

        <input
          type="search"
          value={sellerFilter}
          onChange={(e) => { setSellerFilter(e.target.value); setPage(1); }}
          placeholder="Filter by seller..."
          className="bg-(--color-surface-2) border border-(--color-border)
                     text-(--color-text-primary) text-sm rounded-md px-3 py-2"
          aria-label="Filter by seller username"
        />

        <span className="text-sm text-(--color-text-muted) self-center">
          {filtered.length} result{filtered.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* ── Table ───────────────────────────────────────────────── */}
      <div className="overflow-x-auto rounded-md border border-(--color-border)">
        <table
          className="w-full text-sm text-(--color-text-primary)"
          aria-label="All listings"
        >
          <thead className="bg-(--color-surface-2) text-(--color-text-secondary)
                            text-xs uppercase tracking-wide">
            <tr>
              <th scope="col" className="px-4 py-3 text-left">Asset</th>
              <th scope="col" className="px-4 py-3 text-left">Rarity</th>
              <th scope="col" className="px-4 py-3 text-left">Seller</th>
              <th scope="col" className="px-4 py-3 text-right">Price</th>
              <th scope="col" className="px-4 py-3 text-left">Status</th>
              <th scope="col" className="px-4 py-3 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-(--color-border)">
            {paginated.filter(Boolean).map((listing) => {
				if (!listing || listing.id == null) return null;
				const status = (listing.status ?? '').toLowerCase();
              return (
                <tr
                  key={listing.id}
                  className="bg-(--color-surface) hover:bg-(--color-surface-2) transition-colors"
                >
                  <td className="px-4 py-3 font-medium">{listing.name}</td>
                  <td className="px-4 py-3">
                    <RarityBadge tier={listing.rarity} size="sm" />
                  </td>
                  <td className="px-4 py-3 text-(--color-text-secondary)">
                    {listing.seller_username ?? "—"}
                  </td>
                  {/* FIX: parseFloat because MySQL DECIMAL comes as string */}
                  <td className="px-4 py-3 text-right font-mono">
					${(parseFloat(listing.price) || 0).toFixed(2)}
				  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                        status === "active"
                          ? "bg-(--color-success-subtle) text-(--color-success)"
                          : status === "sold"
                          ? "bg-(--color-accent-subtle) text-(--color-accent)"
                          : "bg-(--color-surface-3) text-(--color-text-muted)"
                      }`}
                    >
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-center gap-2">
                      <Button
                        variant="secondary"
                        size="sm"
                        loading={cancellingId === listing.id}
                        disabled={status !== "active"}
                        onClick={() => handleForceCancel(listing.id)}
                        aria-label={`Force cancel listing for ${listing.name}`}
                      >
                        Force Cancel
                      </Button>
                      <Button
                        variant="danger"
                        size="sm"
                        loading={deletingId === listing.id}
                        onClick={() => handleDelete(listing.id)}
                        aria-label={`Delete listing for ${listing.name}`}
                      >
                        Delete
                      </Button>
                    </div>
                  </td>
                </tr>
              );
            })}
            {paginated.length === 0 && (
              <tr>
                <td colSpan={6}
                    className="px-4 py-10 text-center text-sm text-(--color-text-muted)">
                  No listings match your filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ── Pagination ──────────────────────────────────────────── */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 mt-4"
             role="navigation" aria-label="Listings pagination">
          <Button
            variant="secondary"
            size="sm"
            disabled={page === 1}
            onClick={() => setPage((p) => p - 1)}
            aria-label="Previous page"
          >
            ← Prev
          </Button>
          <span className="text-sm text-(--color-text-muted)">
            Page {page} of {totalPages}
          </span>
          <Button
            variant="secondary"
            size="sm"
            disabled={page === totalPages}
            onClick={() => setPage((p) => p + 1)}
            aria-label="Next page"
          >
            Next →
          </Button>
        </div>
      )}
    </>
  );
}