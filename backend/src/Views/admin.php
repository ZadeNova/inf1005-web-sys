<?php
ob_start();
?>

<section aria-labelledby="news-heading" class="max-w-7xl mx-auto px-6 py-8 mb-12">
    <h2 id="news-heading" class="text-lg font-semibold text-(--color-text-primary) mb-4">
        Publish Market News
    </h2>
    <div id="create-news-post-root" data-props="{}"></div>
</section>

<section aria-labelledby="listings-heading" class="max-w-7xl mx-auto px-6 pb-16">
    <h2 id="listings-heading" class="text-lg font-semibold text-(--color-text-primary) mb-4">
        Manage Listings
    </h2>
    <div id="admin-listings-manager-root" data-props="{}"></div>
</section>

<?php
$content = ob_get_clean();
require __DIR__ . '/layout.php';
?>