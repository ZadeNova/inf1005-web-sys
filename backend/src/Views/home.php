<?php
/**
 * TODO (integration phase):
 *   - PageController::home() should inject $stats from DB query
 *   - PageController::home() should inject $featured (3 active listings) from DB
 *   - Flip USE_MOCK = false in PriceChart.jsx once /api/v1/market/price-history is live
 */

ob_start();

// ── Fallback stats (used until PageController injects real data) ──────────
$stats = $stats ?? [
    ['label' => 'Total Volume',    'value' => '$2,847,392', 'sub' => 'All time'],
    ['label' => 'Active Listings', 'value' => '14,823',     'sub' => 'Right now'],
    ['label' => 'Registered Users','value' => '8,204',      'sub' => 'And growing'],
    ['label' => 'Floor Price',     'value' => '$1.20',       'sub' => 'Lowest listing'],
    ['label' => '7-Day Change',    'value' => '+24.5%',      'sub' => 'Market trend', 'positive' => true],
];

// ── Fallback featured listings (used until PageController injects real data)
// Shape must match what the PHP template below expects:
// id, name, collection, rarity (label + symbol), condition, price, seller_username
$featured = $featured ?? [
    [
        'id'              => 'asset-001',
        'name'            => 'Shadowfall Genesis #001',
        'collection'      => 'Shadowfall Collection',
        'rarity_label'    => 'Secret Rare',
        'rarity_symbol'   => '♛',
        'rarity_css_key'  => 'secretrare',
        'condition'       => 'Mint',
        'price'           => '$1,299.00',
        'seller'          => 'vault_keeper',
    ],
    [
        'id'              => 'asset-002',
        'name'            => 'Ancient Phoenix',
        'collection'      => 'Celestial Series',
        'rarity_label'    => 'Ultra Rare',
        'rarity_symbol'   => '✦',
        'rarity_css_key'  => 'ultrarare',
        'condition'       => 'Near Mint',
        'price'           => '$480.00',
        'seller'          => 'celestial_trader',
    ],
    [
        'id'              => 'asset-003',
        'name'            => 'Iron Sentinel',
        'collection'      => 'Core Drop 2024',
        'rarity_label'    => 'Rare',
        'rarity_symbol'   => '★',
        'rarity_css_key'  => 'rare',
        'condition'       => 'Lightly Played',
        'price'           => '$34.00',
        'seller'          => 'drop_hunter',
    ],
];
?>

<?php /* ── Skip link ───────────────────────────────────────────────── */ ?>
<a href="#main-content"
   class="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4
          focus:z-9999 focus:px-4 focus:py-2 focus:rounded-md
          focus:bg-(--color-accent) focus:text-white focus:font-semibold
          focus:text-sm focus:shadow-lg focus:outline-none">
    Skip to main content
</a>

<div>

    <?php /* ══════════════════════════════════════════════════════════
       1. HERO
    ══════════════════════════════════════════════════════════════ */ ?>
    <section aria-labelledby="hero-heading"
             class="relative overflow-hidden border-b border-(--color-border)">

        <?php /* Grid texture */ ?>
        <div class="absolute inset-0 pointer-events-none opacity-40"
             aria-hidden="true"
             style="
                background-image:
                    linear-gradient(var(--color-border) 1px, transparent 1px),
                    linear-gradient(90deg, var(--color-border) 1px, transparent 1px);
                background-size: 48px 48px;
             "></div>

        <?php /* Radial accent glow */ ?>
        <div class="absolute inset-0 pointer-events-none"
             aria-hidden="true"
             style="background: radial-gradient(ellipse 60% 50% at 50% 0%,
                    var(--color-accent-glow) 0%, transparent 70%);"></div>

        <div class="relative max-w-7xl mx-auto px-4 sm:px-6 py-20 sm:py-28
                    flex flex-col items-center text-center gap-6">

            <?php /* Live listings pill */ ?>
            <div class="inline-flex items-center gap-2 px-3 py-1.5 rounded-full
                        bg-(--color-accent-subtle) border border-(--color-accent)
                        text-xs font-semibold text-(--color-accent)">
                <span class="w-1.5 h-1.5 rounded-full bg-(--color-accent)"
                      aria-hidden="true"
                      style="animation: pulse 2s cubic-bezier(0.4,0,0.6,1) infinite;"></span>
                Live Market — 14,823 Active Listings
            </div>

            <h1 id="hero-heading"
                class="text-4xl sm:text-5xl lg:text-6xl font-bold
                       text-(--color-text-primary) max-w-3xl leading-tight">
                Trade Digital Assets
                <span class="block text-(--color-accent)">With Confidence</span>
            </h1>

            <p class="text-base sm:text-lg text-(--color-text-secondary)
                      max-w-xl leading-relaxed">
                Vapour FT is a peer-to-peer marketplace for rare digital
                collectibles. Atomic transactions, real-time pricing, and
                five rarity tiers — from Common to Secret Rare.
            </p>

            <?php /* CTA buttons */ ?>
            <div class="flex flex-wrap items-center justify-center gap-3 mt-2">
                <a href="/listings"
                   class="inline-flex items-center gap-2 px-6 py-3 rounded-md
                          text-sm font-semibold text-white bg-(--color-accent)
                          hover:bg-(--color-accent-hover) transition-colors
                          focus-visible:outline-2 focus-visible:outline-(--color-accent)
                          focus-visible:outline-offset-2">
                    Browse Market
                    <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none"
                         stroke="currentColor" stroke-width="2" aria-hidden="true">
                        <path d="M5 12h14M12 5l7 7-7 7"/>
                    </svg>
                </a>
                <a href="/register"
                   class="inline-flex items-center gap-2 px-6 py-3 rounded-md
                          text-sm font-semibold text-(--color-text-primary)
                          border border-(--color-border)
                          hover:border-(--color-accent) hover:text-(--color-accent)
                          transition-colors focus-visible:outline-2
                          focus-visible:outline-(--color-accent) focus-visible:outline-offset-2">
                    Create Account
                </a>
            </div>

            <?php /* Feature pills */ ?>
            <div class="flex flex-wrap items-center justify-center gap-2 mt-4">
                <?php
                $pills = [
                    [
                        'icon'  => '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>',
                        'label' => 'Atomic Transactions',
                    ],
                    [
                        'icon'  => '<polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>',
                        'label' => 'Real-Time Pricing',
                    ],
                    [
                        'icon'  => '<polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/>',
                        'label' => '5 Rarity Tiers',
                    ],
                ];
                foreach ($pills as $pill):
                ?>
                <div class="flex items-center gap-2 px-4 py-2 rounded-full
                            bg-(--color-surface) border border-(--color-border)
                            text-sm text-(--color-text-secondary)">
                    <svg class="w-4 h-4 text-(--color-accent)" viewBox="0 0 24 24"
                         fill="none" stroke="currentColor" stroke-width="1.5"
                         aria-hidden="true">
                        <?= $pill['icon'] ?>
                    </svg>
                    <?= htmlspecialchars($pill['label']) ?>
                </div>
                <?php endforeach; ?>
            </div>
        </div>
    </section>

    <?php /* ══════════════════════════════════════════════════════════
       2. STATS BAR
    ══════════════════════════════════════════════════════════════ */ ?>
    <section aria-label="Market statistics"
             class="border-b border-(--color-border) bg-(--color-surface)">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 py-6">
            <dl class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                <?php foreach ($stats as $stat): ?>
                <div class="bg-(--color-surface) border border-(--color-border)
                            rounded-lg p-4 flex flex-col gap-1">
                    <dt class="text-[11px] font-semibold uppercase tracking-widest
                               text-(--color-text-muted)">
                        <?= htmlspecialchars($stat['label']) ?>
                    </dt>
                    <dd class="text-2xl font-bold tabular-nums truncate
                               <?= !empty($stat['positive'])
                                   ? 'text-(--color-success)'
                                   : 'text-(--color-text-primary)' ?>">
                        <?= htmlspecialchars($stat['value']) ?>
                    </dd>
                    <?php if (!empty($stat['sub'])): ?>
                    <dd class="text-xs text-(--color-text-muted)">
                        <?= htmlspecialchars($stat['sub']) ?>
                    </dd>
                    <?php endif; ?>
                </div>
                <?php endforeach; ?>
            </dl>
        </div>
    </section>

    <?php /* ══════════════════════════════════════════════════════════
       3. PRICE CHART — React island
    ══════════════════════════════════════════════════════════════ */ ?>
    <section aria-labelledby="chart-heading"
             class="border-b border-(--color-border)">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 py-10">

            <div class="mb-6">
                <p class="text-[11px] font-semibold uppercase tracking-widest
                          text-(--color-accent) mb-1">
                    Live Data
                </p>
                <h2 id="chart-heading"
                    class="text-xl font-bold text-(--color-text-primary)">
                    Market Overview
                </h2>
            </div>

            <div id="price-chart-root" data-props="{}"></div>
        </div>
    </section>

    <?php /* ══════════════════════════════════════════════════════════
       4. FEATURED LISTINGS — pure PHP/HTML
    ══════════════════════════════════════════════════════════════ */ ?>
    <section aria-labelledby="featured-heading"
             class="border-b border-(--color-border)">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 py-10">

            <div class="flex items-end justify-between mb-6 gap-4">
                <div>
                    <p class="text-[11px] font-semibold uppercase tracking-widest
                              text-(--color-accent) mb-1">
                        Hand-picked
                    </p>
                    <h2 id="featured-heading"
                        class="text-xl font-bold text-(--color-text-primary)">
                        Featured Listings
                    </h2>
                </div>
                <a href="/listings"
                   class="flex items-center gap-1.5 text-sm font-semibold
                          text-(--color-accent) hover:text-(--color-accent-hover)
                          transition-colors shrink-0 focus-visible:outline-2
                          focus-visible:outline-(--color-accent) focus-visible:outline-offset-2
                          rounded-sm">
                    View all listings
                    <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none"
                         stroke="currentColor" stroke-width="2" aria-hidden="true">
                        <path d="M5 12h14M12 5l7 7-7 7"/>
                    </svg>
                </a>
            </div>

            <ul class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                <?php foreach ($featured as $asset): ?>
                <li class="bg-(--color-surface) border border-(--color-border)
                            rounded-lg p-4 flex flex-col gap-3
                            hover:border-(--color-accent) transition-colors
                            focus-within:border-(--color-accent)">

                    <?php /* Image placeholder */ ?>
                    <div class="w-full aspect-square bg-(--color-surface-2)
                                rounded-md border border-(--color-border)
                                flex items-center justify-center"
                         aria-hidden="true">
                        <svg class="w-12 h-12 text-(--color-text-muted)"
                             viewBox="0 0 24 24" fill="none"
                             stroke="currentColor" stroke-width="1">
                            <rect x="2" y="2" width="20" height="20" rx="2"/>
                            <path d="m8 8 8 8M8 16l8-8" stroke-width="0.8"/>
                            <rect x="7" y="7" width="10" height="10" rx="1"
                                  stroke-dasharray="2 2" stroke-width="0.8"/>
                        </svg>
                    </div>

                    <?php /* Badges row */ ?>
                    <div class="flex items-center gap-2 flex-wrap">
                        <span class="inline-flex items-center gap-1 text-[10px] font-semibold
                                     px-2 py-0.5 rounded-full border"
                              style="
                                background-color: var(--color-rarity-<?= htmlspecialchars($asset['rarity_css_key']) ?>-bg);
                                border-color:     var(--color-rarity-<?= htmlspecialchars($asset['rarity_css_key']) ?>);
                                color:            var(--color-rarity-<?= htmlspecialchars($asset['rarity_css_key']) ?>-text);
                              ">
                            <span aria-hidden="true"><?= htmlspecialchars($asset['rarity_symbol']) ?></span>
                            <?= htmlspecialchars($asset['rarity_label']) ?>
                        </span>

                        <span class="inline-flex items-center text-[10px] font-semibold
                                     px-2 py-0.5 rounded-full
                                     bg-(--color-surface-2) border border-(--color-border)
                                     text-(--color-text-muted)">
                            <?= htmlspecialchars($asset['condition']) ?>
                        </span>
                    </div>

                    <?php /* Name + collection */ ?>
                    <div class="flex flex-col gap-0.5">
                        <h3 class="text-sm font-bold text-(--color-text-primary) leading-snug">
                            <a href="/listings?asset=<?= urlencode($asset['id']) ?>"
                               class="hover:text-(--color-accent) transition-colors
                                      focus-visible:outline-2 focus-visible:outline-(--color-accent)
                                      focus-visible:outline-offset-2 rounded-sm">
                                <?= htmlspecialchars($asset['name']) ?>
                            </a>
                        </h3>
                        <p class="text-xs text-(--color-text-muted)">
                            <?= htmlspecialchars($asset['collection']) ?>
                        </p>
                        <p class="text-[11px] text-(--color-text-muted)">
                            Listed by
                            <a href="/profile?user=<?= urlencode($asset['seller']) ?>"
                               class="text-(--color-accent) hover:underline
                                      focus-visible:outline-2 focus-visible:outline-(--color-accent)
                                      focus-visible:outline-offset-1 rounded-sm">
                                <?= htmlspecialchars($asset['seller']) ?>
                            </a>
                        </p>
                    </div>

                    <?php /* Price + CTA */ ?>
                    <div class="flex items-center justify-between pt-2
                                border-t border-(--color-border) mt-auto">
                        <p class="text-lg font-bold text-(--color-text-primary) tabular-nums">
                            <?= htmlspecialchars($asset['price']) ?>
                        </p>
                        <a href="/listings?asset=<?= urlencode($asset['id']) ?>"
                           class="inline-flex items-center gap-1.5 px-3 py-1.5
                                  rounded-md text-xs font-semibold text-white
                                  bg-(--color-accent) hover:bg-(--color-accent-hover)
                                  transition-colors focus-visible:outline-2
                                  focus-visible:outline-(--color-accent)
                                  focus-visible:outline-offset-2">
                            View
                            <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none"
                                 stroke="currentColor" stroke-width="2" aria-hidden="true">
                                <path d="M5 12h14M12 5l7 7-7 7"/>
                            </svg>
                        </a>
                    </div>
                </li>
                <?php endforeach; ?>
            </ul>
        </div>
    </section>

    <?php /* ══════════════════════════════════════════════════════════
       5. CTA BANNER
    ══════════════════════════════════════════════════════════════ */ ?>
    <section aria-labelledby="cta-heading">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 py-16">

            <div class="relative overflow-hidden bg-(--color-surface)
                        border border-(--color-border) rounded-xl p-8 sm:p-12
                        text-center">

                <div class="absolute inset-0 pointer-events-none"
                     aria-hidden="true"
                     style="background: radial-gradient(ellipse 70% 80% at 50% 50%,
                            var(--color-accent-glow) 0%, transparent 70%);"></div>

                <div class="relative flex flex-col items-center gap-4">
                    <h2 id="cta-heading"
                        class="text-2xl sm:text-3xl font-bold text-(--color-text-primary)">
                        Ready to Start Trading?
                    </h2>
                    <p class="text-(--color-text-secondary) max-w-md">
                        Join thousands of collectors buying, selling, and trading
                        rare digital assets on Vapour FT.
                    </p>
                    <div class="flex flex-wrap justify-center gap-3 mt-2">
                        <a href="/register"
                           class="inline-flex items-center gap-2 px-6 py-3
                                  rounded-md text-sm font-semibold text-white
                                  bg-(--color-accent) hover:bg-(--color-accent-hover)
                                  transition-colors focus-visible:outline-2
                                  focus-visible:outline-(--color-accent)
                                  focus-visible:outline-offset-2">
                            Get Started Free
                        </a>
                        <a href="/listings"
                           class="inline-flex items-center gap-2 px-6 py-3
                                  rounded-md text-sm font-semibold
                                  text-(--color-text-primary) border border-(--color-border)
                                  hover:border-(--color-accent) hover:text-(--color-accent)
                                  transition-colors focus-visible:outline-2
                                  focus-visible:outline-(--color-accent)
                                  focus-visible:outline-offset-2">
                            Explore Market
                        </a>
                    </div>
                </div>
            </div>
        </div>
    </section>

</div>

<?php
$content = ob_get_clean();
require __DIR__ . '/layout.php';
?>