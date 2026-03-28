<?php
ob_start();
?>

<a href="#main-content"
   class="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4
          focus:z-9999 focus:px-4 focus:py-2 focus:rounded-md
          focus:bg-(--color-accent) focus:text-white focus:font-semibold
          focus:text-sm focus:shadow-lg focus:outline-none">
    Skip to main content
</a>

<main id="main-content" class="max-w-7xl mx-auto px-4 sm:px-6 py-10 flex flex-col gap-8">

    <?php /* Back link */ ?>
    <a href="/listings"
       class="inline-flex items-center gap-2 text-sm text-(--color-text-secondary)
              hover:text-(--color-text-primary) transition-colors w-fit
              focus-visible:outline-2 focus-visible:outline-(--color-accent) focus-visible:outline-offset-2 rounded-sm">
        <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none"
             stroke="currentColor" stroke-width="2" aria-hidden="true">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
        </svg>
        Back to listings
    </a>

    <?php /* Listing detail island — two-column layout (image+info | buy panel) */ ?>
    <div id="listing-detail-root"
         data-listing-id="<?= (int) $listingId ?>">
    </div>

    <?php /* Price history chart island — full width below detail */ ?>
    <section aria-labelledby="price-chart-heading">
        <h2 id="price-chart-heading"
            class="text-base font-bold text-(--color-text-primary) mb-4">
            Price History
        </h2>
        <div id="listing-price-chart-root"
             data-listing-id="<?= (int) $listingId ?>">
        </div>
    </section>

</main>

<?php
$content = ob_get_clean();
require __DIR__ . '/layout.php';
?>