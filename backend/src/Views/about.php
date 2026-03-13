<?php
ob_start();
?>

<section class="max-w-7xl mx-auto px-6 py-16">
    <h1 class="text-4xl font-bold text-white mb-4">About Vapour FT</h1>
    <p class="text-gray-400 text-lg max-w-2xl">
        Vapour FT is a premium digital asset marketplace for in-game collectibles.
        Built with banking-grade transaction safety and real-time pricing.
    </p>
</section>

<?php
$content = ob_get_clean();
require __DIR__ . '/layout.php';
?>