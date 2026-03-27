/**
 * AdminListingsManager.jsx — Lead Island
 * Mounts via: mountIsland('admin-listings-manager-root', AdminListingsManager)
 * PHP view: backend/src/Views/admin.php
 * Page entry: src/pages/admin.jsx
 *
 * Admin CRUD panel for listings intervention.
 * Admins can view all active listings, force-cancel suspicious ones,
 * edit price/status, or hard-delete a listing.
 *
 * API endpoints (when USE_MOCK = false):
 *   GET    /api/v1/admin/listings             → { listings: [...] }
 *   PATCH  /api/v1/admin/listings/:id         → { listing } (edit price/status)
 *   DELETE /api/v1/admin/listings/:id         → { success }
 */

import { useState } from "react";
import Card from "../../shared/atoms/Card.jsx";
import Button from "../../shared/atoms/Button.jsx";
import Skeleton from "../../shared/atoms/Skeleton.jsx";
import { RarityBadge } from "../../shared/atoms/Badge.jsx";
import { useApi } from "../../shared/hooks/useApi.js";
import {
	mockAssets,
	USE_MOCK,
	TRANSACTION_STATUS,
} from "../../shared/mockAssets.js";

// ── Inline edit modal ──────────────────────────────────────────────────────
function EditModal({ listing, onSave, onClose }) {
	const [price, setPrice] = useState(String(parseFloat(listing.price)));
	const [status, setStatus] = useState(listing.status);
	const [saving, setSaving] = useState(false);
	const [error, setError] = useState(null);

	async function handleSave() {
		const parsed = parseFloat(price);
		if (isNaN(parsed) || parsed <= 0) {
			setError("Price must be a positive number.");
			return;
		}
		setSaving(true);
		await onSave(listing.id, { price: parsed, status });
		setSaving(false);
		onClose();
	}

	return (
		/* Backdrop */
		<div
			role="dialog"
			aria-modal="true"
			aria-labelledby="edit-modal-title"
			className="
        fixed inset-0 z-50 flex items-center justify-center
        bg-black/60 px-4
      "
		>
			<Card variant="default" padding="lg" className="w-full max-w-sm">
				<h3
					id="edit-modal-title"
					className="text-base font-semibold text-(--color-text-primary) mb-4"
				>
					Edit Listing — {listing.name}
				</h3>

				<div className="flex flex-col gap-4">
					<div>
						<label
							htmlFor="edit-price"
							className="block text-sm font-medium text-(--color-text-secondary) mb-1"
						>
							Price (USD)
						</label>
						<input
							id="edit-price"
							type="number"
							min="0.01"
							step="0.01"
							value={price}
							onChange={(e) => setPrice(e.target.value)}
							aria-describedby={error ? "edit-price-error" : undefined}
							aria-invalid={!!error}
							className="
                w-full px-3 py-2 text-sm rounded-md
                bg-(--color-input-bg) border border-(--color-input-border)
                text-(--color-text-primary)
                focus:outline-none focus:border-(--color-input-focus)
                transition-colors
              "
						/>
						{error && (
							<p
								id="edit-price-error"
								role="alert"
								className="text-xs text-(--color-danger) mt-1"
							>
								{error}
							</p>
						)}
					</div>

					<div>
						<label
							htmlFor="edit-status"
							className="block text-sm font-medium text-(--color-text-secondary) mb-1"
						>
							Status
						</label>
						<select
							id="edit-status"
							value={status}
							onChange={(e) => setStatus(e.target.value)}
							className="
                w-full px-3 py-2 text-sm rounded-md
                bg-(--color-input-bg) border border-(--color-input-border)
                text-(--color-text-primary)
                focus:outline-none focus:border-(--color-input-focus)
                transition-colors
              "
						>
							{Object.values(TRANSACTION_STATUS).map((s) => (
								<option key={s} value={s}>
									{s}
								</option>
							))}
						</select>
					</div>
				</div>

				<div className="flex justify-end gap-2 mt-6">
					<Button variant="secondary" size="sm" onClick={onClose}>
						Cancel
					</Button>
					<Button
						variant="primary"
						size="sm"
						loading={saving}
						onClick={handleSave}
					>
						Save Changes
					</Button>
				</div>
			</Card>
		</div>
	);
}

// ── Main island ────────────────────────────────────────────────────────────
export default function AdminListingsManager() {
	const { data, loading, error } = useApi(
		USE_MOCK ? null : "/api/v1/admin/listings",
		{ auto: !USE_MOCK },
	);

	const [listings, setListings] = useState(USE_MOCK ? mockAssets : []);
	const [editing, setEditing] = useState(null); // listing object being edited
	const [deletingId, setDeletingId] = useState(null);
	const [actionError, setActionError] = useState(null);

	// Sync from API when not mocking
	const displayListings = USE_MOCK ? listings : (data?.listings ?? []);

	async function handleDelete(id) {
		if (
			!window.confirm("Permanently remove this listing? This cannot be undone.")
		)
			return;
		setDeletingId(id);
		setActionError(null);

		if (USE_MOCK) {
			await new Promise((r) => setTimeout(r, 500));
			setListings((prev) => prev.filter((l) => l.id !== id));
			setDeletingId(null);
			return;
		}

		try {
			const csrf =
				document.querySelector('meta[name="csrf-token"]')?.content ?? "";
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

	async function handleSaveEdit(id, updates) {
		if (USE_MOCK) {
			setListings((prev) =>
				prev.map((l) => (l.id === id ? { ...l, ...updates } : l)),
			);
			return;
		}

		try {
			const csrf =
				document.querySelector('meta[name="csrf-token"]')?.content ?? "";
			const res = await fetch(`/api/v1/admin/listings/${id}`, {
				method: "PATCH",
				headers: { "Content-Type": "application/json", "X-CSRF-Token": csrf },
				body: JSON.stringify(updates),
			});
			if (!res.ok) throw new Error(`Server error ${res.status}`);
		} catch (err) {
			setActionError(err.message);
		}
	}

	if (loading) {
		return (
			<div
				className="flex flex-col gap-3"
				role="status"
				aria-label="Loading listings"
			>
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
				<p
					role="alert"
					aria-live="assertive"
					className="text-sm text-(--color-danger) mb-4"
				>
					{actionError}
				</p>
			)}

			{/* Responsive table wrapper */}
			<div className="overflow-x-auto rounded-md border border-(--color-border)">
				<table
					className="w-full text-sm text-(--color-text-primary)"
					aria-label="All active listings"
				>
					<thead className="bg-(--color-surface-2) text-(--color-text-secondary) text-xs uppercase tracking-wide">
						<tr>
							<th scope="col" className="px-4 py-3 text-left">
								Asset
							</th>
							<th scope="col" className="px-4 py-3 text-left">
								Rarity
							</th>
							<th scope="col" className="px-4 py-3 text-left">
								Seller
							</th>
							<th scope="col" className="px-4 py-3 text-right">
								Price
							</th>
							<th scope="col" className="px-4 py-3 text-left">
								Status
							</th>
							<th scope="col" className="px-4 py-3 text-center">
								Actions
							</th>
						</tr>
					</thead>
					<tbody className="divide-y divide-(--color-border)">
						{displayListings.map((listing) => (
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
								<td className="px-4 py-3 text-right font-mono">
									${parseFloat(listing.price).toFixed(2)}
								</td>
								<td className="px-4 py-3">
									<span
										className={`text-xs font-medium px-2 py-0.5 rounded-full ${
											listing.status === "ACTIVE"
												? "bg-(--color-success-subtle) text-(--color-success)"
												: "bg-(--color-warning-subtle) text-(--color-warning)"
										}`}
									>
										{listing.status}
									</span>
								</td>
								<td className="px-4 py-3">
									<div className="flex items-center justify-center gap-2">
										<Button
											variant="secondary"
											size="sm"
											onClick={() => setEditing(listing)}
											aria-label={`Edit listing ${listing.name}`}
										>
											Edit
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
					</tbody>
				</table>
			</div>

			{editing && (
				<EditModal
					listing={editing}
					onSave={handleSaveEdit}
					onClose={() => setEditing(null)}
				/>
			)}
		</>
	);
}
