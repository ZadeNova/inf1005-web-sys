<?php
ob_start();
?>

<section class="max-w-7xl mx-auto px-6 py-16">
    <h1 class="text-4xl font-bold text-white mb-8">Dashboard</h1>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <!-- WalletBalance island -->
        <div id="wallet-balance-root" data-props="{}"></div>
    </div>

    <div class="mb-10">
        <!-- PortfolioTable island -->
        <div id="portfolio-table-root" data-props="{}"></div>
    </div>

    <div class="mb-10">
        <!-- ActiveListings island -->
        <div id="active-listings-root" data-props="{}"></div>
    </div>

    <div>
        <!-- TransactionHistory island -->
        <div id="transaction-history-root" data-props="{}"></div>
    </div>
</section>

<?php
$content = ob_get_clean();
require __DIR__ . '/layout.php';
?>