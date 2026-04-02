<?php
/**
 * listings.php — Market Listings Page View
 * Route:   GET /listings  (Public)
 * Islands: ListingsGrid → #listings-grid-root
 * Auth:    Public — all visitors can browse; buy requires auth (handled inside island)
 *
 * NOTE: There was a legacy listing.php (singular) that mounted a different island.
 * This file is the canonical replacement that matches listings.jsx exactly.
 * The Slim route /listings → PageController::listings → listings.php (this file).
 * Ensure PageController references 'listings', not 'listing'.
 */
ob_start();
?>

<div class="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-10">

    <?php /* ── Hero / collection banner ──────────────────────────── */ ?>
    <header class="mb-8">
        <div class="rounded-xl border border-(--color-border)
                    bg-(--color-surface) overflow-hidden">

            <?php /* Accent gradient top bar */ ?>
            <div class="h-1 w-full bg-(--color-accent)" aria-hidden="true"></div>

            <div class="px-5 sm:px-8 py-6 flex flex-col sm:flex-row
                        sm:items-center justify-between gap-4">
                <div>
                    <p class="text-[11px] font-semibold uppercase tracking-widest
                              text-(--color-accent) mb-1">
                        Live Market
                    </p>
                    <h1 class="text-2xl sm:text-3xl font-bold
                               text-(--color-text-primary)">
                        Market Listings
                    </h1>
                    <p class="text-sm text-(--color-text-secondary) mt-1">
                        Browse, filter, and trade digital collectibles across
                        all rarity tiers and collections.
                    </p>
                </div>

                <?php /* Active drop callout pill */ ?>
                <div class="flex items-center gap-2.5 px-4 py-2.5 rounded-full
                            border border-(--color-border) bg-(--color-surface-2)
                            text-sm text-(--color-text-secondary) shrink-0 self-start sm:self-auto">
                    <span class="w-2 h-2 rounded-full bg-(--color-success) shrink-0"
                          aria-hidden="true"></span>
                    Shadowfall Collection — Active
                </div>
            </div>
        </div>
    </header>

    <?php /* ── ListingsGrid React island ──────────────────────────── */ ?>
    <?php /*
        Island: ListingsGrid
        Mount:  #listings-grid-root
        API:    GET /api/v1/market/listings
        Features: search autocomplete, rarity/condition/sort filters,
                  price range slider, grid/list toggle, pagination.
        All filters and loading/error/empty states are handled inside the island.
    */ ?>
    <section aria-labelledby="listings-heading">
        <h2 id="listings-heading" class="sr-only">Asset listings</h2>

        <div id="listings-grid-root"
             role="region"
             aria-label="Market listings"
             aria-live="polite"
             data-props='<?= json_encode([
                 "userId"    => $_SESSION["user_id"] ?? null,
                 "csrfToken" => $_SESSION["csrf_token"] ?? "",
                 "isAdmin"   => ($_SESSION["user_role"] ?? "") === "admin",
             ], JSON_HEX_APOS | JSON_HEX_QUOT) ?>'>

            <?php /* Skeleton grid — matches the 4-col grid in ListingsGrid.jsx */ ?>
            <div class="flex flex-col gap-6" aria-hidden="true">

                <?php /* Filter bar skeleton */ ?>
                <div class="flex flex-col gap-3 animate-pulse">
                    <div class="flex gap-2 flex-wrap">
                        <div class="h-9 w-64 rounded-full bg-(--color-surface)
                                    border border-(--color-border)"></div>
                        <div class="h-9 w-24 rounded-full bg-(--color-surface)
                                    border border-(--color-border)"></div>
                    </div>
                    <div class="flex flex-wrap gap-2">
                        <?php for ($i = 0; $i < 5; $i++): ?>
                        <div class="h-7 w-20 rounded-full bg-(--color-surface)
                                    border border-(--color-border)"></div>
                        <?php endfor; ?>
                    </div>
                </div>

                <?php /* Card grid skeleton */ ?>
                <div class="grid grid-cols-2 sm:grid-cols-2
                            lg:grid-cols-3 xl:grid-cols-4 gap-5 animate-pulse">
                    <?php for ($i = 0; $i < 8; $i++): ?>
                    <div class="rounded-lg border border-(--color-border)
                                bg-(--color-surface) overflow-hidden flex flex-col">
                        <div class="aspect-square bg-(--color-surface-2)"></div>
                        <div class="p-3 flex flex-col gap-2">
                            <div class="flex gap-2">
                                <div class="h-5 w-14 rounded-full bg-(--color-surface-2)"></div>
                                <div class="h-5 w-12 rounded-full bg-(--color-surface-2)"></div>
                            </div>
                            <div class="h-4 w-3/4 rounded bg-(--color-surface-2)"></div>
                            <div class="h-3 w-1/2 rounded bg-(--color-surface-2)"></div>
                            <div class="flex items-center justify-between mt-2">
                                <div class="h-5 w-16 rounded bg-(--color-surface-2)"></div>
                                <div class="h-8 w-20 rounded-md bg-(--color-surface-2)"></div>
                            </div>
                        </div>
                    </div>
                    <?php endfor; ?>
                </div>
            </div>

            <noscript>
                <p class="text-sm text-(--color-text-secondary) text-center py-12">
                    JavaScript is required to browse the marketplace.
                    Please enable JavaScript and reload the page.
                </p>
            </noscript>
        </div>
    </section>

</div>

<?php
$content = ob_get_clean();
require __DIR__ . '/layout.php';
?>