<?php
/**
 * blog.php — Market News Page View
 * Route:   GET /blog
 * Islands: BlogFeed → #blog-feed-root
 * Auth:    Public
 *
 * FIX: was mounting to 'blog-carousel-root' — corrected to 'blog-feed-root'
 */
ob_start();
?>

<div class="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-10">

    <?php /* ── Page header ────────────────────────────────────────── */ ?>
    <header class="mb-8">
        <p class="text-[11px] font-semibold uppercase tracking-widest
                  text-(--color-accent) mb-1">
            Latest
        </p>
        <h1 class="text-2xl sm:text-3xl font-bold text-(--color-text-primary)">
            Market News
        </h1>
        <p class="text-sm text-(--color-text-secondary) mt-1">
            Collection drops, trading guides, and marketplace updates.
        </p>
    </header>

    <?php /* ── BlogFeed React island ───────────────────────────────── */ ?>
    <?php /*
        Island: BlogFeed
        Mount:  #blog-feed-root
        API:    GET /api/v1/blog/posts
        Handles its own loading / error / success states internally.
    */ ?>
    <div id="blog-feed-root"
         role="region"
         aria-label="Market news feed"
         aria-live="polite"
         data-props='<?= json_encode([], JSON_HEX_APOS | JSON_HEX_QUOT) ?>'>
        <?php /* Skeleton shimmer shown before React hydrates */ ?>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
             aria-hidden="true">
            <?php for ($i = 0; $i < 6; $i++): ?>
            <div class="rounded-lg border border-(--color-border)
                        bg-(--color-surface) p-4 flex flex-col gap-3 animate-pulse">
                <div class="h-4 w-20 rounded bg-(--color-surface-2)"></div>
                <div class="h-5 w-full rounded bg-(--color-surface-2)"></div>
                <div class="h-5 w-3/4 rounded bg-(--color-surface-2)"></div>
                <div class="h-3 w-full rounded bg-(--color-surface-2)"></div>
                <div class="h-3 w-5/6 rounded bg-(--color-surface-2)"></div>
                <div class="h-3 w-16 rounded bg-(--color-surface-2) mt-auto"></div>
            </div>
            <?php endfor; ?>
        </div>
        <noscript>
            <p class="text-sm text-(--color-text-secondary) text-center py-8">
                JavaScript is required to load the news feed.
                Please enable JavaScript and reload the page.
            </p>
        </noscript>
    </div>

</div>

<?php
$content = ob_get_clean();
require __DIR__ . '/layout.php';
?>