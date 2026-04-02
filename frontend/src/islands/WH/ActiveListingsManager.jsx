/**
 * ActiveListingsManager.jsx — Dev 2 Island
 * Owner: WH (Dev 2)
 *
 * CHANGE: all three action outcomes (cancel, edit price, errors) now fire
 * a toast via useToast() so the user has persistent visual confirmation.
 * The three bug fixes from the previous patch are preserved:
 * FIX 1 — parseInt(listing.id) before DELETE/PATCH URL construction.
 * FIX 2 — Edit price modal rendered and wired.
 * FIX 3 — ListedBadgeFixed with fixed w/h so 5-digit prices don't overflow.
 * FIX 4 — Responsive layout: Actions drop below asset info on mobile (sm and below).
 * FIX 5 — Removed fetchListings() from handleCancel to prevent race condition
 *          where the server re-fetch returned the deleted listing before it settled,
 *          causing it to reappear. Also normalised ID comparisons to String() to
 *          guard against number/string type mismatches from the API.
 */

import Card from "../../shared/atoms/Card.jsx";
import Button from "../../shared/atoms/Button.jsx";
import Skeleton from "../../shared/atoms/Skeleton.jsx";
import { RarityBadge } from "../../shared/atoms/Badge.jsx";
import { useState, useEffect, useCallback, useRef } from "react";

const FOCUSABLE = 'a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])';

function useFocusTrap(dialogRef, onClose) {
  useEffect(() => {
    const el = dialogRef.current;
    if (!el) return;
    const prev = document.activeElement;
    el.querySelector(FOCUSABLE)?.focus();
    function onKey(e) {
      if (e.key === 'Escape') { e.stopPropagation(); onClose(); return; }
      if (e.key !== 'Tab') return;
      const nodes = [...el.querySelectorAll(FOCUSABLE)];
      if (!nodes.length) { e.preventDefault(); return; }
      if (e.shiftKey) {
        if (document.activeElement === nodes[0]) { e.preventDefault(); nodes[nodes.length - 1].focus(); }
      } else {
        if (document.activeElement === nodes[nodes.length - 1]) { e.preventDefault(); nodes[0].focus(); }
      }
    }
    document.addEventListener('keydown', onKey);
    return () => { document.removeEventListener('keydown', onKey); prev?.focus(); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dialogRef]);
}
import { useToast } from "../../shared/context/ToastContext.jsx";

/* ── Edit Price Modal ─────────────────────────────────────────────────── */
function EditPriceModal({ listing, onClose, onSuccess }) {
	const [price, setPrice] = useState(String(listing.asset?.price ?? ""));
	const [saving, setSaving] = useState(false);
	const [error, setError] = useState(null);
	const toast = useToast();
	const dialogRef = useRef(null);
	useFocusTrap(dialogRef, onClose);

	const parsed = parseFloat(price);
	const valid = !isNaN(parsed) && parsed > 0 && parsed <= 999999.99;

	async function handleSave() {
		if (!valid) return;
		setSaving(true);
		setError(null);

		try {
			const csrf =
				document.querySelector('meta[name="csrf-token"]')?.content ?? "";
			const id = parseInt(listing.id, 10);
			const res = await fetch(`/api/v1/market/listings/${id}`, {
				method: "PATCH",
				headers: { "Content-Type": "application/json", "X-CSRF-Token": csrf },
				body: JSON.stringify({ price: parsed }),
			});
			if (!res.ok) {
				const err = await res.json().catch(() => ({}));
				throw new Error(err.message ?? `Server error ${res.status}`);
			}
			toast.listing(
				"Price updated",
				`${listing.asset?.name} now listed for $${parsed.toLocaleString("en-US", { minimumFractionDigits: 2 })}`,
			);
			onSuccess(listing.id, parsed);
		} catch (err) {
			const msg = err.message ?? "Failed to update price.";
			setError(msg);
			toast.error("Update failed", msg);
			setSaving(false);
		}
	}

	return (
		<div
			ref={dialogRef}
			role="dialog"
			aria-modal="true"
			aria-labelledby="edit-price-title"
			className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4"
			onClick={(e) => {
				if (e.target === e.currentTarget) onClose();
			}}
		>
			<Card
				variant="default"
				padding="lg"
				className="w-full max-w-xs flex flex-col gap-4"
			>
				<div className="flex items-start justify-between gap-3">
					<div>
						<h2
							id="edit-price-title"
							className="text-sm font-bold text-(--color-text-primary)"
						>
							Edit listing price
						</h2>
						<p className="text-xs text-(--color-text-muted) mt-0.5 truncate max-w-45">
							{listing.asset?.name}
						</p>
					</div>
					<button
						type="button"
						onClick={onClose}
						aria-label="Close modal"
						className="text-(--color-text-muted) hover:text-(--color-text-primary) transition-colors shrink-0"
					>
						<svg
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							strokeWidth={2}
							className="w-4 h-4"
							aria-hidden="true"
						>
							<line x1="18" y1="6" x2="6" y2="18" />
							<line x1="6" y1="6" x2="18" y2="18" />
						</svg>
					</button>
				</div>

				<div className="flex flex-col gap-1.5">
					<label
						htmlFor="edit-listing-price"
						className="text-xs font-semibold text-(--color-text-primary)"
					>
						New price (USD)
					</label>
					<div className="relative">
						<span
							className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-(--color-text-muted)"
							aria-hidden="true"
						>
							$
						</span>
						<input
							id="edit-listing-price"
							type="number"
							min="0.01"
							max="999999.99"
							step="0.01"
							value={price}
							onChange={(e) => setPrice(e.target.value)}
							autoFocus
							className="w-full pl-7 pr-3 py-2.5 text-sm rounded-md
                              bg-(--color-input-bg) border border-(--color-input-border)
                              text-(--color-text-primary)
                              focus:outline-none focus:border-(--color-input-focus)
                              transition-colors"
						/>
					</div>
					{!valid && price !== "" && (
						<p className="text-xs text-(--color-danger)">
							Enter a price between $0.01 and $999,999.99
						</p>
					)}
				</div>

				{error && (
					<p
						role="alert"
						className="text-xs text-(--color-danger) bg-(--color-danger-subtle)
                        border border-(--color-danger) rounded-md px-3 py-2"
					>
						{error}
					</p>
				)}

				<div className="flex gap-2 justify-end">
					<Button
						variant="secondary"
						size="sm"
						onClick={onClose}
						disabled={saving}
					>
						Cancel
					</Button>
					<Button
						variant="primary"
						size="sm"
						loading={saving}
						disabled={!valid}
						onClick={handleSave}
					>
						Save price
					</Button>
				</div>
			</Card>
		</div>
	);
}

/* ── Listed badge (FIX 3: fixed dimensions) ───────────────────────────── */
function ListedBadgeFixed({ price }) {
	const formatted = `$${Number(price).toLocaleString("en-US", {
		minimumFractionDigits: 2,
		maximumFractionDigits: 2,
	})}`;

	return (
		<div
			className="inline-flex items-center gap-2 px-3 rounded-lg
            border border-(--color-success)
            w-30 h-13 shrink-0"
			role="status"
			aria-label={`Listed for sale at ${formatted}`}
		>
			<svg
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				strokeWidth={2.5}
				className="w-3.5 h-3.5 text-(--color-success) shrink-0"
				aria-hidden="true"
				style={{ color: "var(--color-success)" }}
			>
				<polyline points="20 6 9 17 4 12" />
			</svg>
			<div className="flex flex-col leading-tight min-w-0">
				<span className="text-xs font-bold text-(--color-success)">Listed</span>
				<span className="text-[11px] font-semibold text-(--color-success) whitespace-nowrap">
					{formatted}
				</span>
			</div>
		</div>
	);
}

/* ── Main export ──────────────────────────────────────────────────────── */
export default function ActiveListingsManager() {
	const toast = useToast();

	const [localListings, setLocalListings] = useState(null);
	const [cancellingId, setCancellingId] = useState(null);
	const [cancelError, setCancelError] = useState(null);
	const [editingListing, setEditingListing] = useState(null);
	const [stats, setStats] = useState({});

	// Replace useApi with a manual fetch + polling so it refreshes
	// automatically when PortfolioTable creates a new listing
	const fetchListings = useCallback(async () => {
		try {
			const res = await fetch("/api/v1/market/listings/mine", {
				headers: { Accept: "application/json" },
				credentials: "same-origin",
			});
			if (!res.ok) return;
			const json = await res.json();
			setLocalListings(json.listings ?? []);
			setStats(json.stats ?? {});
		} catch (err) {
			// silently ignore — stale data is fine
		}
	}, []);

	useEffect(() => {
		fetchListings();
		// Poll every 8 seconds — picks up new listings from PortfolioTable sell
		const interval = setInterval(fetchListings, 8000);
		return () => clearInterval(interval);
	}, [fetchListings]);

	const rawListings = localListings ?? [];
	const loading = localListings === null;
	const error = null; // errors are silent in polling mode

	/* ── Cancel ──────────────────────────────────────────────────────────── */
	async function handleCancel(listingId) {
		setCancelError(null);
		setCancellingId(listingId);
		try {
			const csrf =
				document.querySelector('meta[name="csrf-token"]')?.content ?? "";
			const numericId = parseInt(listingId, 10);
			if (isNaN(numericId) || numericId <= 0)
				throw new Error("Invalid listing ID.");

			const res = await fetch(`/api/v1/market/listings/${numericId}`, {
				method: "DELETE",
				headers: {
					"X-CSRF-Token": csrf,
					Accept: "application/json",
				},
			});

			if (!res.ok) {
				const err = await res
					.json()
					.catch(() => ({ message: "Failed to cancel listing." }));
				throw new Error(err.message ?? "Failed to cancel listing.");
			}

			// FIX 5: Normalise to String() to guard against number/string mismatch
			const removed = rawListings.find(
				(l) => String(l.id) === String(listingId),
			);
			setLocalListings((prev) =>
				(prev ?? []).filter((l) => String(l.id) !== String(listingId)),
			);
			toast.cancel(
				"Listing cancelled",
				`${removed?.asset?.name ?? "Asset"} removed from market`,
			);

			// FIX 5: Do NOT call fetchListings() here — doing so caused a race
			// condition where the server hadn't settled the DELETE yet, so the
			// re-fetch returned the listing again and it reappeared in the UI.
			// The 8-second poll will sync stats naturally.
		} catch (err) {
			const msg = err.message ?? "Network error. Please try again.";
			setCancelError(msg);
			toast.error("Cancel failed", msg);
		} finally {
			setCancellingId(null);
		}
	}

	/* ── Edit price success ───────────────────────────────────────────────── */
	function handlePriceUpdated(listingId, newPrice) {
		setLocalListings((prev) =>
			(prev ?? []).map((l) =>
				String(l.id) === String(listingId)
					? { ...l, asset: { ...l.asset, price: newPrice } }
					: l,
			),
		);
		setEditingListing(null);
		// Small delay so server has time to commit before we re-fetch
		setTimeout(fetchListings, 500);
	}

	/* ── Loading ─────────────────────────────────────────────────────────── */
	if (loading) {
		return (
			<div
				className="flex flex-col gap-3"
				role="status"
				aria-label="Loading listings"
			>
				{[1, 2, 3].map((i) => (
					<div
						key={i}
						className="flex items-center gap-4 p-4 rounded-lg
                                   border border-(--color-border) bg-(--color-surface) animate-pulse"
					>
						<div className="w-14 h-14 rounded-md bg-(--color-surface-2) shrink-0" />
						<div className="flex-1 flex flex-col gap-2">
							<div className="h-4 w-40 rounded bg-(--color-surface-2)" />
							<div className="h-3 w-20 rounded bg-(--color-surface-2)" />
						</div>
						<div className="h-8 w-20 rounded-full bg-(--color-surface-2)" />
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

	/* ── Render ───────────────────────────────────────────────────────────── */
	return (
		<>
			{cancelError && (
				<p
					role="alert"
					aria-live="assertive"
					className="text-sm text-(--color-danger) bg-(--color-danger-subtle)
                      border border-(--color-danger) rounded-md px-3 py-2 mb-4"
				>
					{cancelError}
				</p>
			)}

			<div className="flex flex-col gap-4">
				{/* Stats row */}
				<div className="flex items-center justify-end">
					<div className="flex items-center gap-4 text-sm">
						<span>
							<span className="font-bold text-(--color-text-primary)">
								{rawListings.length}
							</span>
							<span className="text-(--color-text-muted) ml-1">active</span>
						</span>
						<span>
							<span className="font-bold text-(--color-text-primary)">
								{stats.totalSales ?? "—"}
							</span>
							<span className="text-(--color-text-muted) ml-1">
								total sales
							</span>
						</span>
						<span>
							<span className="font-bold text-(--color-text-primary)">
								{stats.itemsOwned ?? "—"}
							</span>
							<span className="text-(--color-text-muted) ml-1">owned</span>
						</span>
					</div>
				</div>

				{/* Empty state */}
				{rawListings.length === 0 && (
					<div
						className="w-full border-2 border-dashed border-(--color-border)
                          rounded-lg py-10 flex flex-col items-center gap-3 text-center px-4"
					>
						<div
							className="w-12 h-12 rounded-full bg-(--color-surface-2) flex items-center
                            justify-center text-2xl"
							aria-hidden="true"
						>
							📦
						</div>
						<p className="text-sm font-semibold text-(--color-text-primary)">
							No active listings
						</p>
						<p className="text-xs text-(--color-text-muted) max-w-xs">
							Use the{" "}
							<strong className="text-(--color-text-secondary)">Sell</strong>{" "}
							button on any asset in{" "}
							<strong className="text-(--color-text-secondary)">
								My Assets
							</strong>{" "}
							above to create a listing.
						</p>
					</div>
				)}

				{/* Listing rows */}
				{rawListings.length > 0 && (
					<div className="flex flex-col gap-3">
						{rawListings.map((listing) => {
							const isCancelling = cancellingId === listing.id;
							const price = listing.asset?.price ?? 0;

							return (
								<Card
									key={listing.id}
									variant="default"
									padding="md"
									className="flex flex-col sm:flex-row sm:items-center gap-4"
								>
									{/* Group 1: Image + Text (Always side-by-side) */}
									<div className="flex items-center gap-4 flex-1 min-w-0">
										{/* Thumbnail */}
										{(listing.image_url ?? listing.asset?.imageUrl) ? (
											<img
												src={listing.image_url ?? listing.asset?.imageUrl}
												alt={listing.asset?.name}
												className="w-14 h-14 rounded-md object-cover border border-(--color-border) shrink-0"
												loading="lazy"
											/>
										) : (
											<div
												className="w-14 h-14 rounded-md bg-(--color-surface-2)
                                        border border-(--color-border) shrink-0
                                        flex items-center justify-center"
												aria-hidden="true"
											>
												<span className="text-xs text-(--color-text-muted)">
													IMG
												</span>
											</div>
										)}

										{/* Asset info */}
										<div className="flex-1 min-w-0">
											<p className="text-sm font-semibold text-(--color-text-primary) truncate">
												{listing.asset?.name}
											</p>
											<div className="flex flex-wrap gap-1 mt-1">
												<RarityBadge tier={listing.asset?.rarity} size="sm" />
											</div>
											<p className="text-xs text-(--color-text-muted) mt-1">
												Listed{" "}
												{new Date(listing.listedAt).toLocaleDateString(
													"en-US",
													{ month: "short", day: "numeric" },
												)}
											</p>
										</div>
									</div>

									{/* Group 2: Actions (Drops below on mobile, aligns right on sm+) */}
									<div className="shrink-0 flex items-center justify-between sm:flex-col sm:items-end gap-3 sm:gap-2 sm:w-52 mt-1 sm:mt-0 pt-3 sm:pt-0 border-t border-(--color-border) sm:border-t-0">
										<ListedBadgeFixed price={price} />
										<div className="flex items-center gap-2">
											<Button
												variant="secondary"
												size="sm"
												onClick={() => setEditingListing(listing)}
												disabled={isCancelling}
												aria-label={`Edit price for ${listing.asset?.name}`}
												className="rounded-full text-xs px-3"
											>
												Edit
											</Button>
											<Button
												variant="danger"
												size="sm"
												loading={isCancelling}
												onClick={() => handleCancel(listing.id)}
												className="rounded-full text-xs px-3"
												aria-label={`Cancel listing for ${listing.asset?.name}`}
											>
												Cancel
											</Button>
										</div>
									</div>
								</Card>
							);
						})}
					</div>
				)}
			</div>

			{/* FIX 2: Edit price modal */}
			{editingListing && (
				<EditPriceModal
					listing={editingListing}
					onClose={() => setEditingListing(null)}
					onSuccess={handlePriceUpdated}
				/>
			)}
		</>
	);
}
