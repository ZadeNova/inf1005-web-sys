<?php
ob_start();
?>

<div class="max-w-7xl mx-auto px-4 sm:px-6 py-10 flex flex-col gap-8">

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
         data-props='<?= json_encode(["listingId" => (int)$listingId], JSON_HEX_APOS | JSON_HEX_QUOT) ?>'>
    </div>

</div>

<?php
$content = ob_get_clean();
require __DIR__ . '/layout.php';
?>