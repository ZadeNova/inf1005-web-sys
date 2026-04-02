/**
 * ListingsGrid.jsx — Dev 2 Island (Merged & Patched v5)
 * Owner: WH (Dev 2)
 *
 * FIXES vs previous version:
 * FIX-1: Pagination "Next" button correctly disabled. (Server vs Client Pages).
 * FIX-2: Pagination trap resolved using `absolutePage` and `serverPage > 1` checks.
 * FIX-3: Removed early returns for loading/error to prevent layout shifting.
 * FIX-4: Changed skeleton count to match PER_PAGE (4) instead of 8 to stop height jumps.
 * FIX-5: Moved Pagination outside of the loading block entirely so buttons never vanish.
 * MERGE: Kept teammate's accessibility (a11y) improvements on the search bar.
 * MERGE: Cleaned up duplicate wallet variables and fixed missing JSX closing tags.
 */

import { useState, useMemo, useRef, useEffect } from "react";
import AssetCard from "../../shared/molecules/AssetCard.jsx";
import Skeleton from "../../shared/atoms/Skeleton.jsx";
import Button from "../../shared/atoms/Button.jsx";
import BuyModal from "./BuyModal.jsx";
import { useApi } from "../../shared/hooks/useApi.js";
import { RARITY, CONDITION } from "../../shared/constants.js";

const PER_PAGE = 4;
const SERVER_PAGE_SIZE = 20; // must match ListingRepository::$perPage

/* ── Highlight helper ─────────────────────────────────────────────────── */
function highlight(text, query) {
	if (!query || !text) return text;
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

/* ── API shape normaliser ───────────────────────────────────────────────── */
function normaliseListingFromApi(raw) {
	if (raw.name) return raw;
	return {
		id: raw.id,
		name: raw.asset_name ?? "",
		rarity: raw.rarity ?? "",
		condition: raw.condition_state ?? "",
		collection: raw.collection ?? "",
		imageUrl: raw.image_url ?? null,
		price: parseFloat(raw.price ?? 0),
		listedAt: raw.created_at ?? null,
		status: raw.status ?? "active",
		seller: {
			id: raw.seller_id ?? null,
			username: raw.seller_username ?? "",
		},
	};
}

/* ════════════════════════════════════════════════════════════════════════
   MAIN EXPORT
   ════════════════════════════════════════════════════════════════════════ */
export default function ListingsGrid({ userId, isAdmin = false }) {
	const [query, setQuery] = useState("");
	const [search, setSearch] = useState("");
	const [showDropdown, setShowDropdown] = useState(false);
	const [rarity, setRarity] = useState("");
	const [condition, setCondition] = useState("");
	const [sort, setSort] = useState("newest");
	const [view, setView] = useState("grid");
	const [clientPage, setClientPage] = useState(1);
	const [serverPage, setServerPage] = useState(1);
	const [maxPrice, setMaxPrice] = useState(Infinity);
	const [buyTarget, setBuyTarget] = useState(null);
	const [maxPriceInitialised, setMaxPriceInitialised] = useState(false);

	const searchRef = useRef(null);

	/* ── Data fetching ─────────────────────────────────────────────── */
	const listingsUrl = `/api/v1/market/listings?search=${encodeURIComponent(search)}&rarity=${rarity}&condition=${condition}&sort=${sort}&page=${serverPage}`;

	const {
		data,
		loading,
		error,
		refetch: refetchListings,
	} = useApi(listingsUrl);

	// MERGE FIX: Removed duplicate useApi call and walletBalance assignments
	const { data: walletData, refetch: refetchWallet } = useApi(
		!userId ? null : "/api/v1/user/wallet",
		{ auto: !!userId },
	);
	const walletBalance = walletData?.wallet?.balance ?? null;

	const allAssets = (data?.listings ?? []).map(normaliseListingFromApi);

	/* ── Sync maxPrice to absoluteMax on first load ────────────────── */
	const absoluteMax = useMemo(
		() =>
			allAssets.length > 0
				? Math.ceil(Math.max(...allAssets.map((a) => a.price)))
				: 0,
		[allAssets],
	);

	useEffect(() => {
		if (!maxPriceInitialised && absoluteMax > 0) {
			setMaxPrice(absoluteMax);
			setMaxPriceInitialised(true);
		}
	}, [absoluteMax, maxPriceInitialised]);

	/* ── Search autocomplete ───────────────────────────────────────── */
	const suggestions = useMemo(() => {
		if (!query.trim()) return [];
		return allAssets
			.filter((a) => a.name?.toLowerCase().includes(query.toLowerCase()))
			.slice(0, 6);
	}, [query, allAssets]);

	useEffect(() => {
		function handler(e) {
			if (searchRef.current && !searchRef.current.contains(e.target)) {
				setShowDropdown(false);
			}
		}
		document.addEventListener("mousedown", handler);
		return () => document.removeEventListener("mousedown", handler);
	}, []);

	/* ── Client-side filter + sort ─────────────────────────────────── */
	const filtered = allAssets.filter((a) => {
		if (search && !a.name?.toLowerCase().includes(search.toLowerCase()))
			return false;
		if (rarity && a.rarity !== rarity) return false;
		if (condition && a.condition !== condition) return false;
		if (isFinite(maxPrice) && a.price > maxPrice) return false;
		return true;
	});

	const sorted = [...filtered].sort((a, b) => {
		if (sort === "price_asc") return a.price - b.price;
		if (sort === "price_desc") return b.price - a.price;
		return new Date(b.listedAt ?? 0) - new Date(a.listedAt ?? 0);
	});

	/* ── Pagination logic ──────────────────────────────────────────── */
	const totalClientPages = Math.max(1, Math.ceil(sorted.length / PER_PAGE));
	const serverHasMore = allAssets.length >= SERVER_PAGE_SIZE;

	const canGoNext = clientPage < totalClientPages || serverHasMore;
	const canGoPrev = clientPage > 1 || serverPage > 1;

	const absolutePage =
		(serverPage - 1) * (SERVER_PAGE_SIZE / PER_PAGE) + clientPage;
	const absoluteTotalPages = serverHasMore
		? null
		: (serverPage - 1) * (SERVER_PAGE_SIZE / PER_PAGE) + totalClientPages;

	const pageAssets = sorted.slice(
		(clientPage - 1) * PER_PAGE,
		clientPage * PER_PAGE,
	);

	function handleNext() {
		if (clientPage < totalClientPages) {
			setClientPage((p) => p + 1);
		} else if (serverHasMore) {
			setServerPage((p) => p + 1);
			setClientPage(1);
		}
	}

	function handlePrev() {
		if (clientPage > 1) {
			setClientPage((p) => p - 1);
		} else if (serverPage > 1) {
			setServerPage((p) => p - 1);
			setClientPage(SERVER_PAGE_SIZE / PER_PAGE);
		}
	}

	/* ── Handlers ──────────────────────────────────────────────────── */
	function handleBuy(assetId) {
		const listing = allAssets.find((a) => a.id === assetId);
		if (listing) setBuyTarget(listing);
	}

	function handleSelectSuggestion(name) {
		setQuery(name);
		setSearch(name);
		setShowDropdown(false);
		setClientPage(1);
		setServerPage(1);
	}

	function handleSearchSubmit(e) {
		e.preventDefault();
		setSearch(query);
		setShowDropdown(false);
		setClientPage(1);
		setServerPage(1);
	}

	function handleClearFilters() {
		setQuery("");
		setSearch("");
		setRarity("");
		setCondition("");
		setSort("newest");
		if (absoluteMax > 0) setMaxPrice(absoluteMax);
		setClientPage(1);
		setServerPage(1);
	}

	function handleRarityChange(e) {
		setRarity(e.target.value);
		setClientPage(1);
		setServerPage(1);
	}

	function handleConditionChange(e) {
		setCondition(e.target.value);
		setClientPage(1);
		setServerPage(1);
	}

	function handleSortChange(e) {
		setSort(e.target.value);
		setClientPage(1);
		setServerPage(1);
	}

	const hasActiveFilters =
		search ||
		rarity ||
		condition ||
		sort !== "newest" ||
		(isFinite(maxPrice) && maxPrice < absoluteMax);

	/* ── Render ──────────────────────────────────────────────────────── */
	return (
		<>
			<div className="flex flex-col gap-6">
				{/* ── Search ─────────────────────────────────────────── */}
				<div className="flex flex-col gap-3">
					<form
						onSubmit={handleSearchSubmit}
						ref={searchRef}
						className="relative"
					>
						<div className="flex gap-2">
							{/* Teammate's accessible combobox wrapper */}
							<div
								className="relative flex-1"
								role="combobox"
								aria-expanded={showDropdown && suggestions.length > 0}
								aria-haspopup="listbox"
							>
								<input
									type="search"
									value={query}
									onChange={(e) => {
										setQuery(e.target.value);
										setShowDropdown(true);
										if (!e.target.value) {
											setSearch("");
											setClientPage(1);
										}
									}}
									onFocus={() => query && setShowDropdown(true)}
									placeholder="Search listings..."
									className="bg-(--color-surface-2) border border-(--color-border)
										text-(--color-text-primary) placeholder:text-(--color-input-placeholder)
										text-sm rounded-full px-4 py-2 w-full"
									aria-label="Search listings"
									aria-autocomplete="list"
								/>
								{showDropdown && suggestions.length > 0 && (
									<ul
										role="listbox"
										className="absolute top-full left-0 right-0 z-50 mt-1
											bg-(--color-surface) border border-(--color-border)
											rounded-md shadow-lg overflow-hidden"
									>
										{suggestions.map((asset) => (
											<li
												key={asset.id}
												role="option"
												aria-selected="false"
												onMouseDown={() => handleSelectSuggestion(asset.name)}
												className="px-3 py-2 text-sm text-(--color-text-primary)
													hover:bg-(--color-surface-2) cursor-pointer
													flex items-center justify-between gap-2"
											>
												<span>{highlight(asset.name, query)}</span>
												<span className="text-xs text-(--color-text-muted) shrink-0">
													{asset.rarity}
												</span>
											</li>
										))}
									</ul>
								)}
							</div>
							<Button
								variant="primary"
								size="md"
								type="submit"
								aria-label="Submit search"
								className="rounded-full"
							>
								Search
							</Button>
						</div>
						{search && (
							<p className="text-sm text-(--color-text-muted) mt-2">
								{sorted.length} result{sorted.length !== 1 ? "s" : ""} for{" "}
								<span className="font-semibold text-(--color-text-primary)">
									"{search}"
								</span>
							</p>
						)}
					</form>

					{/* ── Filters ─────────────────────────────────────── */}
					<div className="flex flex-wrap gap-3 items-center justify-between">
						<div className="flex flex-wrap gap-3 items-center">
							<select
								value={rarity}
								onChange={handleRarityChange}
								className="bg-(--color-surface-2) border border-(--color-border)
									text-(--color-text-primary) text-sm rounded-md px-3 py-2"
								aria-label="Filter by rarity"
							>
								<option value="">All Rarities</option>
								{Object.values(RARITY).map((r) => (
									<option key={r} value={r}>
										{r}
									</option>
								))}
							</select>

							<select
								value={condition}
								onChange={handleConditionChange}
								className="bg-(--color-surface-2) border border-(--color-border)
									text-(--color-text-primary) text-sm rounded-md px-3 py-2"
								aria-label="Filter by condition"
							>
								<option value="">All Conditions</option>
								{Object.values(CONDITION).map((c) => (
									<option key={c} value={c}>
										{c}
									</option>
								))}
							</select>

							<select
								value={sort}
								onChange={handleSortChange}
								className="bg-(--color-surface-2) border border-(--color-border)
									text-(--color-text-primary) text-sm rounded-md px-3 py-2"
								aria-label="Sort listings"
							>
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

						<div className="flex items-center gap-3">
							{!search && (
								<span className="text-sm text-(--color-text-muted)">
									{sorted.length} listing{sorted.length !== 1 ? "s" : ""}
								</span>
							)}
							<div className="flex gap-1 border border-(--color-border) rounded-md p-0.5">
								<button
									type="button"
									onClick={() => setView("grid")}
									aria-label="Grid view"
									aria-pressed={view === "grid"}
									className={`px-2.5 py-1 rounded text-xs font-semibold transition-colors
										${
											view === "grid"
												? "bg-(--color-accent) text-white"
												: "text-(--color-text-muted) hover:text-(--color-text-primary)"
										}`}
								>
									Grid
								</button>
								<button
									type="button"
									onClick={() => setView("list")}
									aria-label="List view"
									aria-pressed={view === "list"}
									className={`px-2.5 py-1 rounded text-xs font-semibold transition-colors
										${
											view === "list"
												? "bg-(--color-accent) text-white"
												: "text-(--color-text-muted) hover:text-(--color-text-primary)"
										}`}
								>
									List
								</button>
							</div>
						</div>
					</div>

					{/* ── Price range slider ───────────────────────────── */}
					{absoluteMax > 0 && (
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
								value={isFinite(maxPrice) ? maxPrice : absoluteMax}
								onChange={(e) => {
									setMaxPrice(Number(e.target.value));
									setClientPage(1);
								}}
								className="w-48 accent-(--color-accent)"
								aria-label={`Maximum price: $${isFinite(maxPrice) ? maxPrice : absoluteMax}`}
							/>
							<span className="text-sm font-semibold text-(--color-text-primary) w-28">
								Up to $
								{(isFinite(maxPrice) ? maxPrice : absoluteMax).toLocaleString()}
							</span>
						</div>
					)}
				</div>

				{/* ── Dynamic Content Area (Anchored to prevent layout shifts) ── */}
				<div className="min-h-100 flex flex-col">
					{loading ? (
						<div
							className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5"
							role="status"
							aria-label="Loading listings"
						>
							{Array.from({ length: PER_PAGE }, (_, i) => (
								<Skeleton
									key={i}
									variant="card"
									label="Loading asset listing"
								/>
							))}
						</div>
					) : error ? (
						<div className="flex flex-col items-center gap-4 py-16">
							<p role="alert" className="text-(--color-danger) text-sm">
								Failed to load listings: {error}
							</p>
							<Button
								variant="secondary"
								onClick={() => window.location.reload()}
							>
								Retry
							</Button>
						</div>
					) : (
						<>
							{/* ── Empty state ─────────────────────────────────────── */}
							{pageAssets.length === 0 && (
								<p className="text-center text-(--color-text-muted) py-16 text-sm">
									No listings found matching your filters.
								</p>
							)}

							{/* ── Grid view ───────────────────────────────────────── */}
							{view === "grid" && pageAssets.length > 0 && (
								<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
									{pageAssets.map((asset) => (
										<AssetCard
											key={asset.id}
											asset={asset}
											onAddToCart={isAdmin ? null : handleBuy}
											showSeller
										/>
									))}
								</div>
							)}

							{/* ── List view ───────────────────────────────────────── */}
							{view === "list" && pageAssets.length > 0 && (
								<div className="flex flex-col gap-3">
									{pageAssets.map((asset) => (
										<a
											key={asset.id}
											href={`/listings/${asset.id}`}
											className="flex items-center gap-4 p-4 rounded-lg
                                                       bg-(--color-surface) border border-(--color-border)
                                                       hover:border-(--color-accent) transition-colors cursor-pointer group text-left"
										>
											{/* ── Image ── */}
											{asset.imageUrl || asset.image_url ? (
												<img
													src={asset.imageUrl || asset.image_url}
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

											{/* ── Text Info (with Seller) ── */}
											<div className="flex-1 min-w-0">
												<p className="text-sm font-semibold text-(--color-text-primary) truncate">
													{highlight(asset.name, search)}
												</p>
												<p className="text-xs text-(--color-text-muted) mt-0.5">
													{asset.collection} · {asset.rarity}
												</p>
												<div className="flex flex-wrap items-center gap-x-2 gap-y-1 mt-0.5">
													<p className="text-xs text-(--color-text-muted)">
														{asset.condition}
													</p>
													{asset.seller?.username && (
														<>
															<span
																className="text-xs text-(--color-text-muted) hidden sm:inline"
																aria-hidden="true"
															>
																·
															</span>
															<p className="text-xs text-(--color-text-muted)">
																Seller:{" "}
																<span className="font-medium text-(--color-text-primary)">
																	{asset.seller.username}
																</span>
															</p>
														</>
													)}
												</div>
											</div>

											{/* ── Action ── */}
											<div className="flex items-center gap-3 shrink-0">
												<p className="text-sm font-bold text-(--color-text-primary)">
													${asset.price.toLocaleString()}
												</p>
												{!isAdmin && (
												<Button
													variant="primary"
													size="sm"
													onClick={(e) => {
														e.preventDefault();
														handleBuy(asset.id);
													}}
													aria-label={`Buy ${asset.name}`}
													className="rounded-full relative z-10"
												>
													Buy
												</Button>
												)}
											</div>
										</a>
									))}
								</div>
							)}
						</>
					)}
				</div>

				{/* ── Pagination (Moved OUTSIDE loading block) ─────────────────── */}
				{(canGoPrev || canGoNext || serverPage > 1) && (
					<div
						className="flex justify-center items-center gap-2 pt-4"
						role="navigation"
						aria-label="Listings pagination"
					>
						<Button
							variant="secondary"
							size="sm"
							disabled={!canGoPrev || loading}
							onClick={handlePrev}
							aria-label="Previous page"
						>
							← Prev
						</Button>
						<span className="text-sm text-(--color-text-muted) px-2">
							Page {absolutePage}
							{absoluteTotalPages ? ` of ${absoluteTotalPages}` : ""}
						</span>
						<Button
							variant="secondary"
							size="sm"
							disabled={!canGoNext || loading}
							onClick={handleNext}
							aria-label="Next page"
						>
							Next →
						</Button>
					</div>
				)}
			</div>

			{buyTarget && (
				<BuyModal
					listing={buyTarget}
					walletBalance={walletBalance}
					onClose={() => setBuyTarget(null)}
					onSuccess={() => {
						setBuyTarget(null);
						if (refetchListings) refetchListings();
						if (refetchWallet) refetchWallet();
					}}
				/>
			)}
		</>
	);
}
