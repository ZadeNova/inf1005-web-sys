<?php ob_start(); ?>

<section class="max-w-7xl mx-auto px-6 py-20 flex flex-col items-center text-center gap-6">
    <span class="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-(--color-success-subtle) text-(--color-success)">
        🔥 Trending Now
    </span>
    <h1 class="text-5xl font-extrabold text-(--color-text-primary) leading-tight max-w-2xl">
        Trade Digital Collectibles on
        <span class="text-(--color-accent)">Vapour FT</span>
    </h1>
    <p class="text-lg text-(--color-text-secondary) max-w-xl">
        Buy, sell, and trade rare digital assets. Atomic P2P transactions. No middlemen.
    </p>
    <div class="flex gap-3">
        <a href="/listings" class="px-6 py-3 rounded-md bg-(--color-accent) text-white font-semibold text-sm hover:bg-(--color-accent-hover) transition-colors">
            Browse Market
        </a>
        <a href="/register" class="px-6 py-3 rounded-md border border-(--color-border) text-(--color-text-primary) font-semibold text-sm hover:border-(--color-accent) hover:text-(--color-accent) transition-colors">
            Create Account
        </a>
    </div>
</section>

<!-- Stats Bar — values hardcoded for now, will be PHP-injected later -->
<section class="border-y border-(--color-border) bg-(--color-surface)">
    <div class="max-w-7xl mx-auto px-6 py-5 grid grid-cols-2 md:grid-cols-4 gap-6">
        <div class="flex flex-col gap-1">
            <p class="text-xl font-bold text-(--color-text-primary)">$248,391</p>
            <p class="text-xs text-(--color-text-muted) uppercase tracking-wide">Total Volume</p>
        </div>
        <div class="flex flex-col gap-1">
            <p class="text-xl font-bold text-(--color-text-primary)">1,847</p>
            <p class="text-xs text-(--color-text-muted) uppercase tracking-wide">Active Listings</p>
        </div>
        <div class="flex flex-col gap-1">
            <p class="text-xl font-bold text-(--color-text-primary)">12,340</p>
            <p class="text-xs text-(--color-text-muted) uppercase tracking-wide">Registered Users</p>
        </div>
        <div class="flex flex-col gap-1">
            <p class="text-xl font-bold text-(--color-text-primary)">$2.50</p>
            <p class="text-xs text-(--color-text-muted) uppercase tracking-wide">Floor Price</p>
        </div>
    </div>
</section>

<!-- PriceChart island -->
<section class="max-w-7xl mx-auto px-6 py-12 w-full">
    <h2 class="text-xl font-bold text-(--color-text-primary) mb-6">Market Overview</h2>
    <div id="price-chart-root" data-props="{}"></div>
</section>

<!-- FeaturedListings island -->
<section class="max-w-7xl mx-auto px-6 pb-16 w-full">
    <div class="flex items-center justify-between mb-6">
        <h2 class="text-xl font-bold text-(--color-text-primary)">Featured Listings</h2>
        <a href="/listings" class="text-sm text-(--color-accent) hover:text-(--color-accent-hover)">View all →</a>
    </div>
    <div id="featured-listings-root" data-props="{}"></div>
</section>

<?php
$content = ob_get_clean();
require __DIR__ . '/layout.php';
?>