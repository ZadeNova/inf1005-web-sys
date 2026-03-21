/**
 * PortfolioTable.jsx — Dev 2 Island
 * Owner: WH (Dev 2)
 * Mounts via: mountIsland('portfolio-table-root', PortfolioTable)
 * PHP view: backend/src/Views/dashboard.php → <div id="portfolio-table-root">
 *
 * FIX: Market value column and action column now have fixed widths so the
 *      "Market $XX" label never shifts regardless of whether the action is
 *      a "Sell" button or a wider "Listed" badge.
 */

import { useState, useMemo } from "react";
import Card from "../../shared/atoms/Card.jsx";
import Button from "../../shared/atoms/Button.jsx";
import Skeleton from "../../shared/atoms/Skeleton.jsx";
import { RarityBadge, ConditionBadge } from "../../shared/atoms/Badge.jsx";
import { useApi, usePost } from "../../shared/hooks/useApi.js";
import { mockAssets, RARITY, USE_MOCK } from "../../shared/mockAssets.js";

const RARITY_OPTIONS = [
  { value: "",                 label: "All Rarities" },
  { value: RARITY.COMMON,      label: "Common"       },
  { value: RARITY.UNCOMMON,    label: "Uncommon"     },
  { value: RARITY.RARE,        label: "Rare"         },
  { value: RARITY.ULTRA_RARE,  label: "Ultra Rare"   },
  { value: RARITY.SECRET_RARE, label: "Secret Rare"  },
];

const RARITY_LABELS = {
  [RARITY.COMMON]:      "Common",
  [RARITY.UNCOMMON]:    "Uncommon",
  [RARITY.RARE]:        "Rare",
  [RARITY.ULTRA_RARE]:  "Ultra Rare",
  [RARITY.SECRET_RARE]: "Secret Rare",
};

const MOCK_PORTFOLIO = mockAssets.slice(0, 6).map((a, i) => ({
  inventory_id:    `inv-00${i + 1}`,
  asset_id:        a.id,
  asset_name:      a.name,
  rarity:          a.rarity,
  condition_state: a.condition,
  collection:      a.collection,
  image_url:       a.imageUrl,
  market_value:    a.price,
  acquired_at:     "2025-03-01T00:00:00Z",
}));

const MOCK_LISTINGS = [
  { asset: { id: mockAssets[0].id, price: 249.99 } },
];

/* ── Listed badge ────────────────────────────────────────────────────────── */
function ListedBadge({ price }) {
  return (
    <div className="inline-flex items-center gap-2 px-3 py-2 rounded-lg
                    bg-(--color-success-subtle) border border-(--color-success)"
         role="status"
         aria-label={`Listed for sale at $${Number(price).toLocaleString()}`}>
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}
           className="w-3.5 h-3.5 text-(--color-success) shrink-0" aria-hidden="true">
        <polyline points="20 6 9 17 4 12"/>
      </svg>
      <div className="flex flex-col leading-tight">
        <span className="text-xs font-bold text-(--color-success)">Listed</span>
        <span className="text-[11px] font-semibold text-(--color-success) opacity-80">
          ${Number(price).toLocaleString()}
        </span>
      </div>
    </div>
  );
}

/* ── Sell Modal ─────────────────────────────────────────────────────────── */
function SellModal({ item, onClose, onSuccess }) {
  const [price,   setPrice]   = useState("");
  const [phase,   setPhase]   = useState("idle");
  const [message, setMessage] = useState("");

  const { execute: createListing } = usePost("/api/v1/market/listings");

  const parsedPrice = parseFloat(price);
  const validPrice  = !isNaN(parsedPrice) && parsedPrice > 0;

  async function handleList() {
    if (!validPrice) return;
    setPhase("loading");

    if (USE_MOCK) {
      await new Promise((r) => setTimeout(r, 700));
      setPhase("success");
      setMessage(`${item.asset_name} listed for $${parsedPrice.toFixed(2)}.`);
      onSuccess?.({ assetId: item.asset_id, price: parsedPrice });
      return;
    }

    try {
      const result = await createListing({ assetId: item.asset_id, price: parsedPrice });
      setPhase("success");
      setMessage(`${item.asset_name} listed for $${parsedPrice.toFixed(2)}.`);
      onSuccess?.({ ...result, assetId: item.asset_id, price: parsedPrice });
    } catch (err) {
      setPhase("error");
      setMessage(err.message ?? "Failed to create listing. Please try again.");
    }
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="sell-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <Card variant="default" padding="lg" className="w-full max-w-sm flex flex-col gap-5">
        <div className="flex items-start justify-between gap-3">
          <h2 id="sell-modal-title"
              className="text-base font-bold text-(--color-text-primary)">
            {phase === "success" ? "Listing created!" : "List for sale"}
          </h2>
          <button type="button" onClick={onClose} aria-label="Close modal"
                  className="text-(--color-text-muted) hover:text-(--color-text-primary) transition-colors">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}
                 className="w-5 h-5" aria-hidden="true">
              <line x1="18" y1="6"  x2="6"  y2="18"/>
              <line x1="6"  y1="6"  x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        {phase === "success" && (
          <div className="flex flex-col items-center gap-3 py-4 text-center">
            <span className="w-12 h-12 rounded-full bg-(--color-success-subtle)
                             flex items-center justify-center text-(--color-success)">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}
                   className="w-5 h-5" aria-hidden="true">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
            </span>
            <p className="text-sm font-semibold text-(--color-text-primary)">{message}</p>
            <p className="text-xs text-(--color-text-muted)">Your listing is now live on the market.</p>
            <Button variant="primary" size="md" onClick={onClose} className="mt-2">Done</Button>
          </div>
        )}

        {phase === "error" && (
          <div className="flex flex-col gap-3">
            <p role="alert"
               className="text-sm text-(--color-danger) bg-(--color-danger-subtle)
                          border border-(--color-danger) rounded-md px-3 py-2">
              {message}
            </p>
            <div className="flex gap-2 justify-end">
              <Button variant="secondary" size="sm" onClick={onClose}>Cancel</Button>
              <Button variant="primary"   size="sm" onClick={() => setPhase("idle")}>Try again</Button>
            </div>
          </div>
        )}

        {(phase === "idle" || phase === "loading") && (
          <>
            <div className="flex items-center gap-3 p-3 rounded-lg
                            bg-(--color-surface-2) border border-(--color-border)">
              <div className="w-14 h-14 rounded-md bg-(--color-surface) border border-(--color-border)
                              flex items-center justify-center shrink-0" aria-hidden="true">
                <span className="text-xs text-(--color-text-muted)">IMG</span>
              </div>
              <div className="flex flex-col gap-1 min-w-0">
                <p className="text-sm font-bold text-(--color-text-primary) truncate">
                  {item.asset_name}
                </p>
                <div className="flex flex-wrap gap-1">
                  <RarityBadge    tier={item.rarity}              size="sm" />
                  <ConditionBadge condition={item.condition_state} size="sm" />
                </div>
                {item.market_value > 0 && (
                  <p className="text-xs text-(--color-text-muted)">
                    Market value: ${Number(item.market_value).toLocaleString()}
                  </p>
                )}
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="sell-price"
                     className="text-sm font-semibold text-(--color-text-primary)">
                Listing price (USD)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2
                                 text-sm text-(--color-text-muted)" aria-hidden="true">$</span>
                <input
                  id="sell-price"
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="0.00"
                  aria-describedby="sell-price-hint"
                  className="w-full pl-7 pr-3 py-2.5 text-sm rounded-md
                             bg-(--color-input-bg) border border-(--color-input-border)
                             text-(--color-text-primary)
                             focus:outline-none focus:border-(--color-input-focus)
                             transition-colors"
                />
              </div>
              <p id="sell-price-hint" className="text-xs text-(--color-text-muted)">
                {item.market_value > 0
                  ? `Current market floor: $${Number(item.market_value).toLocaleString()}`
                  : "No market price available — set your own price"}
              </p>
            </div>

            <div className="flex gap-2 justify-end">
              <Button variant="secondary" size="md" onClick={onClose} disabled={phase === "loading"}>
                Cancel
              </Button>
              <Button variant="primary" size="md" loading={phase === "loading"}
                      disabled={!validPrice} onClick={handleList}>
                List for sale
              </Button>
            </div>
          </>
        )}
      </Card>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════════
   MAIN EXPORT
   ════════════════════════════════════════════════════════════════════════ */
export default function PortfolioTable() {
  const [sellingItem,  setSellingItem]  = useState(null);
  const [rarityFilter, setRarityFilter] = useState("");
  const [sortBy,       setSortBy]       = useState("newest");

  const {
    data:    portfolioData,
    loading: portfolioLoading,
    error:   portfolioError,
    refetch: refetchPortfolio,
  } = useApi(
    USE_MOCK ? null : "/api/v1/user/portfolio",
    { auto: !USE_MOCK }
  );

  const {
    data:    listingsData,
    refetch: refetchListings,
  } = useApi(
    USE_MOCK ? null : "/api/v1/market/listings/mine",
    { auto: !USE_MOCK }
  );

  const rawItems = USE_MOCK ? MOCK_PORTFOLIO : (portfolioData?.portfolio ?? []);

  const activeListingMap = useMemo(() => {
    const map = {};
    if (USE_MOCK) {
      MOCK_LISTINGS.forEach((l) => { map[String(l.asset.id)] = l.asset.price; });
    } else {
      (listingsData?.listings ?? []).forEach((l) => {
        if (l.asset?.id != null) map[String(l.asset.id)] = l.asset.price;
      });
    }
    return map;
  }, [listingsData]);

  const filtered = useMemo(() => {
    const f = rawItems.filter((item) => !rarityFilter || item.rarity === rarityFilter);
    return [...f].sort((a, b) => {
      if (sortBy === "value_high") return (b.market_value ?? 0) - (a.market_value ?? 0);
      if (sortBy === "value_low")  return (a.market_value ?? 0) - (b.market_value ?? 0);
      return new Date(b.acquired_at) - new Date(a.acquired_at);
    });
  }, [rawItems, rarityFilter, sortBy]);

  const selectClass =
    "bg-(--color-surface-2) border border-(--color-border) " +
    "text-(--color-text-primary) text-sm rounded-md px-3 py-2";

  if (portfolioLoading) {
    return (
      <Card variant="default" padding="md" className="flex flex-col gap-3">
        <Skeleton variant="block" height={20} width="30%" label="Loading portfolio" />
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="flex items-center gap-4 py-3
                                   border-b border-(--color-border) last:border-0">
            <Skeleton variant="block" width={48} height={48} />
            <div className="flex-1 flex flex-col gap-2">
              <Skeleton variant="block" height={14} width="50%" />
              <Skeleton variant="block" height={12} width="30%" />
            </div>
            <Skeleton variant="block" width={80} height={32} />
            <Skeleton variant="block" width={64} height={32} />
          </div>
        ))}
      </Card>
    );
  }

  if (portfolioError) {
    return (
      <Card variant="default" padding="md">
        <p role="alert" className="text-sm text-(--color-danger)">
          Failed to load portfolio: {portfolioError}
        </p>
      </Card>
    );
  }

  return (
    <>
      <Card variant="default" padding="md" className="flex flex-col gap-4">

        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-base font-bold text-(--color-text-primary)">
            My Portfolio
            <span className="text-sm font-normal text-(--color-text-muted) ml-2">
              ({rawItems.length} asset{rawItems.length !== 1 ? "s" : ""})
            </span>
          </h2>
          <div className="flex flex-wrap gap-2">
            <select value={rarityFilter} onChange={(e) => setRarityFilter(e.target.value)}
                    className={selectClass} aria-label="Filter by rarity">
              {RARITY_OPTIONS.map(({ value, label }) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}
                    className={selectClass} aria-label="Sort portfolio">
              <option value="newest">Newest first</option>
              <option value="value_high">Value: High to Low</option>
              <option value="value_low">Value: Low to High</option>
            </select>
          </div>
        </div>

        {rawItems.length === 0 && (
          <p className="text-sm text-(--color-text-muted) text-center py-10">
            No assets in your portfolio yet.{" "}
            <a href="/listings" className="text-(--color-accent) hover:underline">
              Browse the market
            </a>
          </p>
        )}

        {rawItems.length > 0 && filtered.length === 0 && rarityFilter && (
          <div className="flex flex-col items-center gap-2 py-10 text-center">
            <p className="text-sm font-semibold text-(--color-text-primary)">
              No {RARITY_LABELS[rarityFilter]} assets in your portfolio
            </p>
            <p className="text-xs text-(--color-text-muted)">
              You don't own any {RARITY_LABELS[rarityFilter]} assets yet.{" "}
              <a href="/listings" className="text-(--color-accent) hover:underline">
                Browse the market
              </a>{" "}
              to find some.
            </p>
          </div>
        )}

        {filtered.length > 0 && (
          <ul className="flex flex-col gap-0" role="list">
            {filtered.map((item, idx) => {
              const listingPrice = activeListingMap[String(item.asset_id)];
              const isListed     = listingPrice !== undefined;

              return (
                <li key={item.inventory_id}
                    className={`flex items-center gap-4 py-3
                      ${idx < filtered.length - 1 ? "border-b border-(--color-border)" : ""}`}>

                  {/* Thumbnail */}
                  <div className="w-12 h-12 rounded-md bg-(--color-surface-2)
                                  border border-(--color-border) shrink-0
                                  flex items-center justify-center"
                       aria-hidden="true">
                    <span className="text-xs text-(--color-text-muted)">IMG</span>
                  </div>

                  {/* Asset info — grows to fill available space */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-(--color-text-primary) truncate">
                      {item.asset_name}
                    </p>
                    <div className="flex flex-wrap gap-1 mt-0.5">
                      <RarityBadge    tier={item.rarity}              size="sm" />
                      <ConditionBadge condition={item.condition_state} size="sm" />
                    </div>
                    <p className="text-xs text-(--color-text-muted) mt-0.5">
                      Acquired{" "}
                      {new Date(item.acquired_at).toLocaleDateString("en-US", {
                        month: "short", day: "numeric", year: "numeric",
                      })}
                    </p>
                  </div>

                  {/*
                    FIX: Market value column has a fixed width (w-20) so it
                    never shifts left or right regardless of whether the
                    action column contains a "Sell" button or "Listed" badge.
                  */}
                  <div className="text-right shrink-0 hidden sm:block w-20">
                    <p className="text-xs text-(--color-text-muted)">Market</p>
                    <p className="text-sm font-bold text-(--color-text-primary)">
                      {item.market_value > 0
                        ? `$${Number(item.market_value).toLocaleString()}`
                        : <span className="text-(--color-text-muted) font-normal">—</span>
                      }
                    </p>
                  </div>

                  {/*
                    FIX: Action column has a fixed width (w-20) matching the
                    market value column so both columns stay stable.
                    Both ListedBadge and Sell button are constrained to this width.
                  */}
                  <div className="shrink-0 flex justify-end w-20">
                    {isListed
                      ? <ListedBadge price={listingPrice} />
                      : (
                        <Button variant="secondary" size="sm"
                                onClick={() => setSellingItem(item)}
                                aria-label={`Sell ${item.asset_name}`}>
                          Sell
                        </Button>
                      )
                    }
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </Card>

      {sellingItem && (
        <SellModal
          item={sellingItem}
          onClose={() => setSellingItem(null)}
          onSuccess={() => {
            refetchPortfolio();
            refetchListings();
            setSellingItem(null);
          }}
        />
      )}
    </>
  );
}