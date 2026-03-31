/**
 * ProfileCollections.jsx — Dev 2 Island
 * Owner: WH (Dev 2)
 * Mounts via: mountIsland('profile-collections-root', ProfileCollections)
 * PHP view: backend/src/Views/profile.php
 *
 * FIX 1: Added normaliseAsset() — API returns { asset_name, market_value,
 *         condition_state } but component expects { name, price, condition }.
 * FIX 2: Added normaliseTransaction() — API returns { asset_name, role,
 *         buyer_username, seller_username, completed_at } but component
 *         expects { asset, type, counterparty, date }.
 * FIX 3: Transaction type filter now consistently uses lowercase 'buy'/'sell'
 *         matching the API's role field.
 * FIX 4: normaliseAsset now passes through image_url so asset images render.
 * Removethis later
 */

import { useState, useMemo } from "react";
import Card from "../../shared/atoms/Card.jsx";
import Button from "../../shared/atoms/Button.jsx";
import Badge from "../../shared/atoms/Badge.jsx";
import Skeleton from "../../shared/atoms/Skeleton.jsx";
import { RarityBadge, ConditionBadge } from "../../shared/atoms/Badge.jsx";
import { useApi } from "../../shared/hooks/useApi.js";
import {
	mockAssets,
	RARITY,
	CONDITION,
	USE_MOCK,
} from "../../shared/mockAssets.js";

/* ── Constants ───────────────────────────────────────────────────────── */
const TABS = ["Owned Assets", "Transaction History"];
const PER_PAGE = 6;
const ALL_RARITIES = Object.values(RARITY);
const ALL_CONDITIONS = Object.values(CONDITION);

const MOCK_TRANSACTIONS = [
	{
		id: "tx-001",
		type: "buy",
		asset: "Shadowfall Genesis #001",
		rarity: RARITY.SECRET_RARE,
		condition: "Mint",
		price: 4200.0,
		date: "2025-03-01",
		counterparty: "NeonTrader",
	},
	{
		id: "tx-002",
		type: "sell",
		asset: "Ancient Phoenix",
		rarity: RARITY.SECRET_RARE,
		condition: "Mint",
		price: 1299.0,
		date: "2025-03-05",
		counterparty: "ShadowHawk",
	},
	{
		id: "tx-003",
		type: "buy",
		asset: "Dark Sorcerer Supreme",
		rarity: RARITY.ULTRA_RARE,
		condition: "Near Mint",
		price: 249.99,
		date: "2025-03-08",
		counterparty: "CelestialX",
	},
	{
		id: "tx-004",
		type: "sell",
		asset: "Forest Guardian",
		rarity: RARITY.UNCOMMON,
		condition: "Lightly Played",
		price: 12.99,
		date: "2025-03-10",
		counterparty: "VaultKeeper",
	},
	{
		id: "tx-005",
		type: "buy",
		asset: "Void Architect #003",
		rarity: RARITY.RARE,
		condition: "Mint",
		price: 89.5,
		date: "2025-03-11",
		counterparty: "0xVault",
	},
	{
		id: "tx-006",
		type: "sell",
		asset: "Neon Wraith",
		rarity: RARITY.COMMON,
		condition: "Moderately Played",
		price: 2.5,
		date: "2025-03-12",
		counterparty: "NeonTrader",
	},
];

/* ── Icons ────────────────────────────────────────────────────────────── */
const PenIcon = () => (
	<svg
		viewBox="0 0 24 24"
		fill="none"
		stroke="currentColor"
		strokeWidth={2}
		className="w-4 h-4"
		aria-hidden="true"
	>
		<path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
		<path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
	</svg>
);
const EyeIcon = () => (
	<svg
		viewBox="0 0 24 24"
		fill="none"
		stroke="currentColor"
		strokeWidth={2}
		className="w-4 h-4"
		aria-hidden="true"
	>
		<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
		<circle cx="12" cy="12" r="3" />
	</svg>
);
const EyeOffIcon = () => (
	<svg
		viewBox="0 0 24 24"
		fill="none"
		stroke="currentColor"
		strokeWidth={2}
		className="w-4 h-4"
		aria-hidden="true"
	>
		<path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
		<path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
		<line x1="1" y1="1" x2="23" y2="23" />
	</svg>
);

/* ── Shared style tokens ─────────────────────────────────────────────── */
const selectClass =
	"bg-(--color-surface-2) border border-(--color-border) " +
	"text-(--color-text-primary) text-sm rounded-md px-3 py-2";
const inputClass =
	"bg-(--color-surface-2) border border-(--color-border) " +
	"text-(--color-text-primary) text-sm rounded-md px-3 py-2 w-full";

/* ── FIX 1 + 4: Asset shape normaliser ──────────────────────────────────
   API:       { inventory_id, asset_id, asset_name, rarity, condition_state,
                collection, market_value, acquired_at, image_url }
   Component: { id, name, rarity, condition, collection, price, image_url }
   ─────────────────────────────────────────────────────────────────────── */
function normaliseAsset(a) {
	return {
		id: a.asset_id ?? a.id,
		name: a.asset_name ?? a.name ?? "",
		rarity: a.rarity ?? "",
		condition: a.condition_state ?? a.condition ?? "",
		collection: a.collection ?? "",
		price: Number(a.market_value ?? a.price ?? 0),
		image_url: a.image_url ?? null, // FIX 4: pass through image
	};
}

/* ── FIX 2: Transaction shape normaliser ────────────────────────────────
   API:       { id, asset_name, rarity, price, role, buyer_username,
                seller_username, completed_at }
   Component: { id, type, asset, rarity, condition, price, date, counterparty }
   type is lowercase 'buy' | 'sell' throughout — consistent with API role field
   ─────────────────────────────────────────────────────────────────────── */
function normaliseTransaction(t) {
	const type = (t.role ?? t.type ?? "buy").toLowerCase();
	return {
		id: t.id,
		type, // 'buy' | 'sell'
		asset: t.asset_name ?? t.asset ?? "",
		rarity: t.rarity ?? "",
		condition: t.condition ?? "Mint",
		price: Number(t.price ?? 0),
		date: t.completed_at ?? t.date ?? "",
		counterparty:
			t.counterparty ??
			(type === "buy" ? t.seller_username : t.buyer_username) ??
			"",
	};
}

/* ════════════════════════════════════════════════════════════════════════
   MAIN EXPORT
   ════════════════════════════════════════════════════════════════════════ */
export default function ProfileCollections() {
	/* ── API ─────────────────────────────────────────────────────────── */
	const { data: portfolioData, loading: portfolioLoading } = useApi(
		USE_MOCK ? null : "/api/v1/user/portfolio",
		{ auto: !USE_MOCK },
	);
	const { data: txData, loading: txLoading } = useApi(
		USE_MOCK ? null : "/api/v1/user/transactions",
		{ auto: !USE_MOCK },
	);

	// FIX: normalise API shapes so all downstream code uses consistent field names
	const ownedAssets = USE_MOCK
		? mockAssets.map(normaliseAsset)
		: (portfolioData?.portfolio ?? []).map(normaliseAsset);

	const transactions = USE_MOCK
		? MOCK_TRANSACTIONS.map(normaliseTransaction)
		: (txData?.transactions ?? []).map(normaliseTransaction);

	/* ── State ───────────────────────────────────────────────────────── */
	const [activeTab, setActiveTab] = useState("Owned Assets");
	const [view, setView] = useState("grid");
	const [page, setPage] = useState(1);

	// Looking For
	const [editingInterests, setEditingInterests] = useState(false);
	const [interests, setInterests] = useState([
		RARITY.SECRET_RARE,
		RARITY.ULTRA_RARE,
		RARITY.RARE,
	]);
	const [mintPreferred, setMintPreferred] = useState(true);

	// Favourite Asset
	const [editingFavourite, setEditingFavourite] = useState(false);
	const [favouriteIndex, setFavouriteIndex] = useState(0);
	const [favSearch, setFavSearch] = useState("");
	const [favRarity, setFavRarity] = useState("");

	// Owned Assets filters
	const [ownedSort, setOwnedSort] = useState("low");
	const [ownedRarity, setOwnedRarity] = useState("");

	// Transaction History filters — type uses lowercase 'buy'|'sell' matching API
	const [txSort, setTxSort] = useState("low");
	const [txRarity, setTxRarity] = useState("");
	const [txCondition, setTxCondition] = useState("");
	const [txType, setTxType] = useState(""); // '' | 'buy' | 'sell'
	const [historyVisible, setHistoryVisible] = useState(true);

	/* ── Derived data ────────────────────────────────────────────────── */
	const favouriteAsset = ownedAssets[favouriteIndex] ?? ownedAssets[0];

	const filteredFavAssets = useMemo(
		() =>
			ownedAssets.filter((a) => {
				if (
					favSearch &&
					!a.name.toLowerCase().includes(favSearch.toLowerCase())
				)
					return false;
				if (favRarity && a.rarity !== favRarity) return false;
				return true;
			}),
		[favSearch, favRarity, ownedAssets],
	);

	const filteredOwned = useMemo(() => {
		const f = ownedAssets.filter(
			(a) => !ownedRarity || a.rarity === ownedRarity,
		);
		return [...f].sort((a, b) =>
			ownedSort === "high" ? b.price - a.price : a.price - b.price,
		);
	}, [ownedSort, ownedRarity, ownedAssets]);

	const totalPages = Math.ceil(filteredOwned.length / PER_PAGE);
	const pagedAssets = filteredOwned.slice(
		(page - 1) * PER_PAGE,
		page * PER_PAGE,
	);

	const filteredTx = useMemo(() => {
		const f = transactions.filter((tx) => {
			// FIX: filter on tx.type which is now consistently lowercase 'buy'|'sell'
			if (txType && tx.type !== txType) return false;
			if (txRarity && tx.rarity !== txRarity) return false;
			if (txCondition && tx.condition !== txCondition) return false;
			return true;
		});
		return [...f].sort((a, b) =>
			txSort === "high" ? b.price - a.price : a.price - b.price,
		);
	}, [txSort, txRarity, txCondition, txType, transactions]);

	function handleTabChange(tab) {
		setActiveTab(tab);
		setPage(1);
	}

	function toggleInterest(rarity) {
		setInterests((prev) =>
			prev.includes(rarity)
				? prev.filter((r) => r !== rarity)
				: [...prev, rarity],
		);
	}

	/* ── Render ──────────────────────────────────────────────────────── */
	return (
		<div className="flex flex-col gap-6">
			{/* ══ Looking For card ═══════════════════════════════════════ */}
			<Card variant="default" padding="md" className="flex flex-col gap-3">
				<div className="flex items-center justify-between">
					<h3 className="text-sm font-bold text-(--color-text-primary)">
						Looking For
					</h3>
					<button
						type="button"
						onClick={() => setEditingInterests((e) => !e)}
						aria-label={
							editingInterests ? "Close interests editor" : "Edit interests"
						}
						aria-expanded={editingInterests}
						className="text-(--color-text-muted) hover:text-(--color-accent) transition-colors"
					>
						<PenIcon />
					</button>
				</div>

				{editingInterests ? (
					<div className="flex flex-col gap-3">
						<p className="text-xs text-(--color-text-muted)">
							Select rarities you are looking for:
						</p>
						<div
							className="flex flex-wrap gap-2"
							role="group"
							aria-label="Rarity interests"
						>
							{ALL_RARITIES.map((r) => (
								<button
									key={r}
									type="button"
									onClick={() => toggleInterest(r)}
									aria-pressed={interests.includes(r)}
									className={`text-xs px-3 py-1 rounded-full border font-semibold transition-colors
                          ${
														interests.includes(r)
															? "bg-(--color-accent) border-(--color-accent) text-white"
															: "bg-transparent border-(--color-border) text-(--color-text-muted) hover:border-(--color-accent)"
													}`}
								>
									{r}
								</button>
							))}
						</div>
						<label className="flex items-center gap-2 text-sm text-(--color-text-primary) cursor-pointer">
							<input
								type="checkbox"
								checked={mintPreferred}
								onChange={(e) => setMintPreferred(e.target.checked)}
								className="accent-(--color-accent)"
							/>
							Mint condition preferred
						</label>
						<Button
							variant="primary"
							size="sm"
							onClick={() => setEditingInterests(false)}
						>
							Done
						</Button>
					</div>
				) : (
					<div className="flex flex-wrap gap-2">
						{interests.map((interest) => (
							<Badge
								key={interest}
								label={interest}
								colour="accent"
								size="sm"
							/>
						))}
						{mintPreferred && (
							<span className="text-xs text-(--color-text-muted) self-center">
								+ Mint condition preferred
							</span>
						)}
					</div>
				)}
			</Card>

			{/* ══ Favourite Asset card ════════════════════════════════════ */}
			<Card variant="default" padding="md" className="flex flex-col gap-3">
				<div className="flex items-center justify-between">
					<h3 className="text-sm font-bold text-(--color-text-primary)">
						⭐ Favourite Asset
					</h3>
					<button
						type="button"
						onClick={() => setEditingFavourite((e) => !e)}
						aria-label={
							editingFavourite
								? "Close favourite picker"
								: "Edit favourite asset"
						}
						aria-expanded={editingFavourite}
						className="text-(--color-text-muted) hover:text-(--color-accent) transition-colors"
					>
						<PenIcon />
					</button>
				</div>

				{editingFavourite ? (
					<div className="flex flex-col gap-3">
						<div className="flex flex-wrap gap-2">
							<input
								type="search"
								value={favSearch}
								onChange={(e) => setFavSearch(e.target.value)}
								placeholder="Search assets..."
								className={`${inputClass} flex-1 min-w-0`}
								aria-label="Search favourite asset"
							/>
							<select
								value={favRarity}
								onChange={(e) => setFavRarity(e.target.value)}
								className={selectClass}
								aria-label="Filter by rarity"
							>
								<option value="">All Rarities</option>
								{ALL_RARITIES.map((r) => (
									<option key={r} value={r}>
										{r}
									</option>
								))}
							</select>
						</div>
						<div
							className="flex flex-col gap-2 max-h-60 overflow-y-auto"
							role="listbox"
							aria-label="Select favourite asset"
						>
							{filteredFavAssets.length === 0 ? (
								<p className="text-sm text-(--color-text-muted) text-center py-4">
									No assets found
								</p>
							) : (
								filteredFavAssets.map((asset) => (
									<button
										key={asset.id}
										type="button"
										role="option"
										aria-selected={
											ownedAssets.indexOf(asset) === favouriteIndex
										}
										onClick={() => {
											setFavouriteIndex(ownedAssets.indexOf(asset));
											setEditingFavourite(false);
											setFavSearch("");
											setFavRarity("");
										}}
										className={`flex items-center gap-3 p-3 rounded-lg border text-left transition-colors
                            ${
															ownedAssets.indexOf(asset) === favouriteIndex
																? "border-(--color-accent) bg-(--color-accent-subtle)"
																: "border-(--color-border) hover:border-(--color-accent)"
														}`}
									>
										{/* ── Favourite selector thumbnail ── */}
										{asset.image_url ? (
											<img
												src={asset.image_url}
												alt={asset.name}
												className="w-10 h-10 rounded object-cover border border-(--color-border) shrink-0"
												loading="lazy"
											/>
										) : (
											<div
												className="w-10 h-10 rounded bg-(--color-surface-2) border border-(--color-border)
                                      flex items-center justify-center shrink-0"
												aria-hidden="true"
											>
												<span className="text-xs text-(--color-text-muted)">
													IMG
												</span>
											</div>
										)}
										<div>
											<p className="text-sm font-semibold text-(--color-text-primary)">
												{asset.name}
											</p>
											<p className="text-xs text-(--color-text-muted)">
												{asset.rarity} · {asset.collection}
											</p>
										</div>
									</button>
								))
							)}
						</div>
					</div>
				) : favouriteAsset ? (
					<div className="flex items-center gap-4">
						{/* ── Favourite asset display thumbnail ── */}
						{favouriteAsset.image_url ? (
							<img
								src={favouriteAsset.image_url}
								alt={favouriteAsset.name}
								className="w-16 h-16 rounded-md object-cover border border-(--color-border) shrink-0"
								loading="lazy"
							/>
						) : (
							<div
								className="w-16 h-16 rounded-md bg-(--color-surface-2) border border-(--color-border)
                              shrink-0 flex items-center justify-center"
								aria-hidden="true"
							>
								<span className="text-xs text-(--color-text-muted)">IMG</span>
							</div>
						)}
						<div className="flex flex-col gap-1">
							<p className="text-sm font-bold text-(--color-text-primary)">
								{favouriteAsset.name}
							</p>
							<div className="flex flex-wrap gap-1">
								<RarityBadge tier={favouriteAsset.rarity} size="sm" />
								<ConditionBadge
									condition={favouriteAsset.condition}
									size="sm"
								/>
							</div>
							<p className="text-xs text-(--color-text-muted)">
								{favouriteAsset.collection}
							</p>
						</div>
					</div>
				) : null}
			</Card>

			{/* ══ Tabbed collection section ═══════════════════════════════ */}
			<section aria-label="My collection">
				<div
					className="flex gap-0 border-b border-(--color-border) mb-6"
					role="tablist"
					aria-label="Collection views"
				>
					{TABS.map((tab) => (
						<button
							key={tab}
							type="button"
							role="tab"
							id={`tab-${tab.replace(/\s+/g, "-").toLowerCase()}`}
							aria-selected={activeTab === tab}
							aria-controls={`panel-${tab.replace(/\s+/g, "-").toLowerCase()}`}
							onClick={() => handleTabChange(tab)}
							onKeyDown={(e) => {
								const idx = TABS.indexOf(tab);
								if (e.key === "ArrowRight" && idx < TABS.length - 1)
									document
										.getElementById(
											`tab-${TABS[idx + 1].replace(/\s+/g, "-").toLowerCase()}`,
										)
										?.focus();
								if (e.key === "ArrowLeft" && idx > 0)
									document
										.getElementById(
											`tab-${TABS[idx - 1].replace(/\s+/g, "-").toLowerCase()}`,
										)
										?.focus();
							}}
							className={`px-4 py-2.5 text-sm font-semibold transition-colors border-b-2 -mb-px
                                whitespace-nowrap focus-visible:outline-2
                                focus-visible:outline-(--color-accent) focus-visible:-outline-offset-2
                      ${
												activeTab === tab
													? "border-(--color-accent) text-(--color-accent)"
													: "border-transparent text-(--color-text-muted) hover:text-(--color-text-primary)"
											}`}
						>
							{tab}
						</button>
					))}
				</div>

				{/* ── Owned Assets panel ────────────────────────────────── */}
				{activeTab === "Owned Assets" && (
					<div
						id="panel-owned-assets"
						role="tabpanel"
						aria-labelledby="tab-owned-assets"
						tabIndex={0}
						className="flex flex-col gap-4"
					>
						<div className="flex flex-wrap gap-3 items-center justify-between">
							<div className="flex flex-wrap gap-2">
								<select
									value={ownedRarity}
									onChange={(e) => {
										setOwnedRarity(e.target.value);
										setPage(1);
									}}
									className={selectClass}
									aria-label="Filter by rarity"
								>
									<option value="">All Rarities</option>
									{ALL_RARITIES.map((r) => (
										<option key={r} value={r}>
											{r}
										</option>
									))}
								</select>
								<select
									value={ownedSort}
									onChange={(e) => setOwnedSort(e.target.value)}
									className={selectClass}
									aria-label="Sort order"
								>
									<option value="low">Default</option>
									<option value="high">Price: High to Low</option>
								</select>
							</div>
							<div className="flex items-center gap-3">
								<p className="text-sm text-(--color-text-muted)">
									{filteredOwned.length} assets
								</p>
								<div
									className="flex gap-1 border border-(--color-border) rounded-md p-0.5"
									role="group"
									aria-label="View mode"
								>
									<button
										type="button"
										onClick={() => setView("grid")}
										aria-pressed={view === "grid"}
										aria-label="Grid view"
										className={`px-2.5 py-1 rounded text-xs font-semibold transition-colors
                            ${view === "grid" ? "bg-(--color-accent) text-white" : "text-(--color-text-muted) hover:text-(--color-text-primary)"}`}
									>
										Grid
									</button>
									<button
										type="button"
										onClick={() => setView("list")}
										aria-pressed={view === "list"}
										aria-label="List view"
										className={`px-2.5 py-1 rounded text-xs font-semibold transition-colors
                            ${view === "list" ? "bg-(--color-accent) text-white" : "text-(--color-text-muted) hover:text-(--color-text-primary)"}`}
									>
										List
									</button>
								</div>
							</div>
						</div>

						{portfolioLoading && (
							<div
								className="grid grid-cols-2 sm:grid-cols-3 gap-4"
								aria-label="Loading assets"
							>
								{Array.from({ length: 6 }, (_, i) => (
									<Skeleton key={i} variant="card" label="Loading asset" />
								))}
							</div>
						)}

						{!portfolioLoading && filteredOwned.length === 0 && (
							<p className="text-center text-(--color-text-muted) py-12 text-sm">
								No assets found.
							</p>
						)}

						{!portfolioLoading && view === "grid" && pagedAssets.length > 0 && (
							<ul className="grid grid-cols-2 sm:grid-cols-3 gap-4" role="list">
								{pagedAssets.map((asset) => (
									<li key={asset.id}>
										<Card
											variant="default"
											padding="sm"
											className="flex flex-col gap-3"
										>
											{/* ── Grid view thumbnail ── */}
											{asset.image_url ? (
												<img
													src={asset.image_url}
													alt={asset.name}
													className="w-full aspect-square object-cover rounded-md border border-(--color-border)"
													loading="lazy"
												/>
											) : (
												<div
													className="w-full aspect-square bg-(--color-surface-2) rounded-md
                                        border border-(--color-border) flex items-center justify-center"
													aria-hidden="true"
												>
													<span className="text-xs text-(--color-text-muted)">
														IMG
													</span>
												</div>
											)}
											<div className="flex flex-col gap-1">
												<p className="text-sm font-bold text-(--color-text-primary) line-clamp-2">
													{asset.name}
												</p>
												<div className="flex flex-wrap gap-1">
													<RarityBadge tier={asset.rarity} size="sm" />
												</div>
												<p className="text-xs text-(--color-text-muted)">
													{asset.collection}
												</p>
												<p className="text-sm font-bold text-(--color-text-primary)">
													${asset.price.toLocaleString()}
												</p>
											</div>
										</Card>
									</li>
								))}
							</ul>
						)}

						{!portfolioLoading && view === "list" && pagedAssets.length > 0 && (
							<ul className="flex flex-col gap-3" role="list">
								{pagedAssets.map((asset) => (
									<li
										key={asset.id}
										className="flex items-center gap-4 p-4 rounded-lg
                                 bg-(--color-surface) border border-(--color-border)"
									>
										{/* ── List view thumbnail ── */}
										{asset.image_url ? (
											<img
												src={asset.image_url}
												alt={asset.name}
												className="w-16 h-16 rounded-md object-cover border border-(--color-border) shrink-0"
												loading="lazy"
											/>
										) : (
											<div
												className="w-16 h-16 rounded-md bg-(--color-surface-2) border border-(--color-border)
                                      shrink-0 flex items-center justify-center"
												aria-hidden="true"
											>
												<span className="text-xs text-(--color-text-muted)">
													IMG
												</span>
											</div>
										)}
										<div className="flex-1 min-w-0">
											<p className="text-sm font-bold text-(--color-text-primary) truncate">
												{asset.name}
											</p>
											<div className="flex flex-wrap gap-1 mt-1">
												<RarityBadge tier={asset.rarity} size="sm" />
												<ConditionBadge condition={asset.condition} size="sm" />
											</div>
											<p className="text-xs text-(--color-text-muted) mt-1">
												{asset.collection}
											</p>
										</div>
										<p className="text-sm font-bold text-(--color-text-primary) shrink-0">
											${asset.price.toLocaleString()}
										</p>
									</li>
								))}
							</ul>
						)}

						{totalPages > 1 && (
							<div
								className="flex items-center justify-center gap-2 pt-2"
								role="navigation"
								aria-label="Asset pagination"
							>
								<Button
									variant="secondary"
									size="sm"
									onClick={() => setPage((p) => Math.max(1, p - 1))}
									disabled={page === 1}
									aria-label="Previous page"
								>
									←
								</Button>
								<span className="text-sm text-(--color-text-muted)">
									Page {page} of {totalPages}
								</span>
								<Button
									variant="secondary"
									size="sm"
									onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
									disabled={page === totalPages}
									aria-label="Next page"
								>
									→
								</Button>
							</div>
						)}
					</div>
				)}

				{/* ── Transaction History panel ──────────────────────────── */}
				{activeTab === "Transaction History" && (
					<div
						id="panel-transaction-history"
						role="tabpanel"
						aria-labelledby="tab-transaction-history"
						tabIndex={0}
						className="flex flex-col gap-4"
					>
						<div className="flex flex-wrap items-center gap-3 justify-between">
							<div className="flex flex-wrap gap-2">
								<select
									value={txRarity}
									onChange={(e) => setTxRarity(e.target.value)}
									className={selectClass}
									aria-label="Filter by rarity"
								>
									<option value="">All Rarities</option>
									{ALL_RARITIES.map((r) => (
										<option key={r} value={r}>
											{r}
										</option>
									))}
								</select>
								<select
									value={txCondition}
									onChange={(e) => setTxCondition(e.target.value)}
									className={selectClass}
									aria-label="Filter by condition"
								>
									<option value="">All Conditions</option>
									{ALL_CONDITIONS.map((c) => (
										<option key={c} value={c}>
											{c}
										</option>
									))}
								</select>
								<select
									value={txSort}
									onChange={(e) => setTxSort(e.target.value)}
									className={selectClass}
									aria-label="Sort order"
								>
									<option value="low">Default</option>
									<option value="high">Price: High to Low</option>
								</select>

								{/* FIX: type filter uses lowercase 'buy'|'sell' consistently */}
								<div
									className="flex gap-1 border border-(--color-border) rounded-md p-0.5"
									role="group"
									aria-label="Transaction type filter"
								>
									<button
										type="button"
										onClick={() => setTxType((t) => (t === "buy" ? "" : "buy"))}
										aria-pressed={txType === "buy"}
										className={`px-2.5 py-1 rounded text-xs font-semibold transition-colors
                            ${
															txType === "buy"
																? "bg-(--color-success) text-white"
																: "text-(--color-text-muted) hover:text-(--color-text-primary)"
														}`}
									>
										Buy
									</button>
									<button
										type="button"
										onClick={() =>
											setTxType((t) => (t === "sell" ? "" : "sell"))
										}
										aria-pressed={txType === "sell"}
										className={`px-2.5 py-1 rounded text-xs font-semibold transition-colors
                            ${
															txType === "sell"
																? "bg-(--color-danger) text-white"
																: "text-(--color-text-muted) hover:text-(--color-text-primary)"
														}`}
									>
										Sell
									</button>
								</div>
							</div>

							<button
								type="button"
								onClick={() => setHistoryVisible((v) => !v)}
								aria-label={
									historyVisible
										? "Hide transaction history"
										: "Show transaction history"
								}
								className="flex items-center gap-1.5 text-xs text-(--color-text-muted)
                                 hover:text-(--color-accent) transition-colors"
							>
								{historyVisible ? <EyeIcon /> : <EyeOffIcon />}
								{historyVisible ? "Hide History" : "Show History"}
							</button>
						</div>

						{txLoading && (
							<div
								className="flex flex-col gap-3"
								aria-label="Loading transactions"
							>
								{Array.from({ length: 4 }, (_, i) => (
									<Skeleton
										key={i}
										variant="block"
										height={64}
										label="Loading transaction"
									/>
								))}
							</div>
						)}

						{!txLoading && !historyVisible && (
							<div className="flex flex-col items-center gap-2 py-12">
								<EyeOffIcon />
								<p className="text-sm text-(--color-text-muted)">
									Transaction history is hidden
								</p>
								<button
									type="button"
									onClick={() => setHistoryVisible(true)}
									className="text-xs text-(--color-accent) hover:underline"
								>
									Show history
								</button>
							</div>
						)}

						{!txLoading && historyVisible && filteredTx.length === 0 && (
							<p className="text-center text-(--color-text-muted) py-12 text-sm">
								No transactions found.
							</p>
						)}

						{!txLoading && historyVisible && filteredTx.length > 0 && (
							<ul className="flex flex-col gap-3" role="list">
								{filteredTx.map((tx) => (
									<li
										key={tx.id}
										className="flex items-center gap-3 p-4 rounded-lg bg-(--color-surface)
                                 border border-(--color-border) flex-wrap sm:flex-nowrap"
									>
										{/* FIX: badge colour and label driven by lowercase tx.type */}
										<span
											className={`text-xs font-bold px-2 py-1 rounded shrink-0
                      ${
												tx.type === "buy"
													? "bg-(--color-success-subtle) text-(--color-success)"
													: "bg-(--color-danger-subtle) text-(--color-danger)"
											}`}
										>
											{tx.type.toUpperCase()}
										</span>
										<p className="text-sm font-semibold text-(--color-text-primary) flex-1 truncate min-w-0">
											{tx.asset}
										</p>
										<div className="hidden sm:flex gap-1 shrink-0">
											<RarityBadge tier={tx.rarity} size="sm" />
											<ConditionBadge condition={tx.condition} size="sm" />
										</div>
										<p className="text-xs text-(--color-text-muted) shrink-0 hidden md:block">
											{tx.type === "buy" ? "from" : "to"} {tx.counterparty} for{" "}
											<span className="text-sm font-semibold text-(--color-text-primary)">
												${tx.price.toLocaleString()}
											</span>
										</p>
										<p className="text-xs text-(--color-text-muted) shrink-0">
											{new Date(tx.date).toLocaleDateString("en-US", {
												month: "short",
												day: "numeric",
											})}
										</p>
									</li>
								))}
							</ul>
						)}
					</div>
				)}
			</section>
		</div>
	);
}
