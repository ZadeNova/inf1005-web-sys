<?php
ob_start();
?>

<section class="max-w-7xl mx-auto px-6 py-16">
    <h1 class="text-4xl font-bold text-white mb-8">Market News</h1>
    <!-- BlogCarousel React island mounts here -->
    <div id="blog-carousel-root" data-props="{}"></div>
</section>

<?php
$content = ob_get_clean();
require __DIR__ . '/layout.php';
?>