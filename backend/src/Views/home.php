<?php
// Start output buffering to capture this page's content
// layout.php will inject it via $content
ob_start();
?>

<section class="max-w-7xl mx-auto px-6 py-16">

    <!-- Hero -->
    <div class="text-center mb-16">
        <h1 class="text-5xl font-bold text-white mb-4">
            The Digital Asset Exchange
        </h1>
        <p class="text-gray-400 text-lg max-w-2xl mx-auto">
            Trade rare in-game collectibles with banking-grade security. 
            Real-time pricing. Atomic transactions. Zero compromise.
        </p>
        <div class="mt-8 flex gap-4 justify-center">
            <a href="/register" 
               class="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-3 rounded-lg font-medium">
                Get Started
            </a>
            <a href="/listings" 
               class="border border-gray-700 hover:border-indigo-400 text-gray-300 px-6 py-3 rounded-lg font-medium">
                Browse Market
            </a>
        </div>
    </div>

    <!-- Market Stats Bar -->
    <div class="grid grid-cols-3 gap-6 mb-16">
        <div class="bg-gray-900 border border-gray-800 rounded-xl p-6 text-center">
            <p class="text-gray-400 text-sm mb-1">24h Volume</p>
            <p class="text-2xl font-bold text-white">$248,391</p>
        </div>
        <div class="bg-gray-900 border border-gray-800 rounded-xl p-6 text-center">
            <p class="text-gray-400 text-sm mb-1">Active Listings</p>
            <p class="text-2xl font-bold text-white">1,847</p>
        </div>
        <div class="bg-gray-900 border border-gray-800 rounded-xl p-6 text-center">
            <p class="text-gray-400 text-sm mb-1">Registered Traders</p>
            <p class="text-2xl font-bold text-white">12,340</p>
        </div>
    </div>

    <!-- React Island placeholder: Price Chart -->
    <div class="bg-gray-900 border border-gray-800 rounded-xl p-6 mb-16">
        <h2 class="text-lg font-semibold text-white mb-4">Market Trends</h2>
        <!-- PriceChart React island mounts here -->
        <div id="price-chart-root" 
             aria-label="Market price chart"
             class="h-64 flex items-center justify-center text-gray-500">
            Loading chart...
        </div>
    </div>

</section>

<?php
$content = ob_get_clean();
require __DIR__ . '/layout.php';
?>
