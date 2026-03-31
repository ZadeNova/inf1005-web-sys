/**
 * AdminListingsManager.jsx — Lead Island
 * Refactored: removed EditModal, added ForceCancel, client-side filters + pagination
 */

import { useState, useMemo } from "react";
import Card from "../../shared/atoms/Card.jsx";
import Button from "../../shared/atoms/Button.jsx";
import Skeleton from "../../shared/atoms/Skeleton.jsx";
import { RarityBadge } from "../../shared/atoms/Badge.jsx";
import { useApi } from "../../shared/hooks/useApi.js";
import { mockAssets, USE_MOCK } from "../../shared/mockAssets.js";

const PAGE_SIZE = 10;

const MOCK_LISTINGS = mockAssets.map((a, i) => ({
  id: String(i + 1),
  price: String(a.price),
  status: "ACTIVE",
  created_at: "2026-03-01 12:00:00",
  name: a.name,
  rarity: a.rarity,
  condition_state: a.condition,
  seller_username: a.seller?.username ?? "mock_user",
}));

export default function AdminListingsManager() {
  const { data, loading, error } = useApi(
    USE_MOCK ? null : "/api/v1/admin/listings",
    { auto: !USE_MOCK }
  );

  const [listings, setListings] = useState(USE_MOCK ? MOCK_LISTINGS : []);
  const [deletingId, setDeletingId] = useState(null);
  const [cancellingId, setCancellingId] = useState(null);
  const [actionError, setActionError] = useState(null);

  // Filters
  const [statusFilter, setStatusFilter] = useState("");
  const [rarityFilter, setRarityFilter] = useState("");
  const [sellerFilter, setSellerFilter] = useState("");

  // Pagination
  const [page, setPage] = useState(1);

  const displayListings = USE_MOCK ? listings : (data?.listings ?? []);

  // Client-side filtering
  const filtered = useMemo(() => {
    setPage(1); // reset on filter change is handled via dependency
    return displayListings.filter((l) => {
      if (statusFilter && l.status !== statusFilter) return false;
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
  }, [displayListings, statusFilter, rarityFilter, sellerFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  function resetPage() {
    setPage(1);
  }

  async function handleDelete(id) {
    if (!window.confirm("Permanently remove this listing? This cannot be undone.")) return;
    setDeletingId(id);
    setActionError(null);
    if (USE_MOCK) {
      await new Promise((r) => setTimeout(r, 500));
      setListings((prev) => prev.filter((l) => l.id !== id));
      setDeletingId(null);
      return;
    }
    try {
      const csrf = document.querySelector('meta[name="csrf-token"]')?.content ?? "";
      const res = await fetch(`/api/v1/admin/listings/${id}`, {
        method: "DELETE",
        headers: { "X-CSRF-Token": csrf },
      });
      if (!res.ok) throw new Error(`Server error ${res.status}`);
    } catch (err) {
      setActionError(err.message);
    } finally {
      setDeletingId(null);
    }
  }

  async function handleForceCancel(id) {
    setCancellingId(id);
    setActionError(null);
    if (USE_MOCK) {
      await new Promise((r) => setTimeout(r, 500));
      setListings((prev) =>
        prev.map((l) => (l.id === id ? { ...l, status: "CANCELLED" } : l))
      );
      setCancellingId(null);
      return;
    }
    try {
      const csrf = document.querySelector('meta[name="csrf-token"]')?.content ?? "";
      const res = await fetch(`/api/v1/admin/listings/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", "X-CSRF-Token": csrf },
        body: JSON.stringify({ status: "CANCELLED" }),
      });
      if (!res.ok) throw new Error(`Server error ${res.status}`);
      // Update local state — no full refetch needed
      // For live data we mutate the data array directly via a local copy
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
      <p role="alert" className="text-sm text-(--color-danger)">
        Failed to load listings: {error}
      </p>
    );
  }

  return (
    <>
      {actionError && (
        <p role="alert" aria-live="assertive" className="text-sm text-(--color-danger) mb-4">
          {actionError}
        </p>
      )}

      {/* ── Filters ─────────────────────────────────────────────── */}
      <div className="flex flex-wrap gap-3 mb-4">
        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); resetPage(); }}
          className={selectClass}
          aria-label="Filter by status"
        >
          <option value="">All Statuses</option>
          <option value="ACTIVE">Active</option>
          <option value="SOLD">Sold</option>
          <option value="CANCELLED">Cancelled</option>
        </select>

        <select
          value={rarityFilter}
          onChange={(e) => { setRarityFilter(e.target.value); resetPage(); }}
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
          onChange={(e) => { setSellerFilter(e.target.value); resetPage(); }}
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
          <thead className="bg-(--color-surface-2) text-(--color-text-secondary) text-xs uppercase tracking-wide">
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
            {paginated.map((listing) => (
              <tr
                key={listing.id}
                className="bg-(--color-surface) hover:bg-(--color-surface-2) transition-colors"
              >
                <td className="px-4 py-3 font-medium">{listing.name}</td>
                <td className="px-4 py-3">
                  <RarityBadge tier={listing.rarity} size="sm" />
                </td>
                {/* FIX: flat field, not nested object */}
                <td className="px-4 py-3 text-(--color-text-secondary)">
                  {listing.seller_username ?? "—"}
                </td>
                {/* FIX: MySQL DECIMAL returns as string */}
                <td className="px-4 py-3 text-right font-mono">
                  ${parseFloat(listing.price).toFixed(2)}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                      listing.status === "ACTIVE"
                        ? "bg-(--color-success-subtle) text-(--color-success)"
                        : listing.status === "SOLD"
                        ? "bg-(--color-accent-subtle) text-(--color-accent)"
                        : "bg-(--color-surface-3) text-(--color-text-muted)"
                    }`}
                  >
                    {listing.status}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-center gap-2">
                    {/* Force Cancel — only active when status is ACTIVE */}
                    <Button
                      variant="secondary"
                      size="sm"
                      loading={cancellingId === listing.id}
                      disabled={listing.status !== "ACTIVE"}
                      onClick={() => handleForceCancel(listing.id)}
                      aria-label={`Force cancel listing ${listing.name}`}
                    >
                      Force Cancel
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      loading={deletingId === listing.id}
                      onClick={() => handleDelete(listing.id)}
                      aria-label={`Delete listing ${listing.name}`}
                    >
                      Delete
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
            {paginated.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-sm text-(--color-text-muted)">
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