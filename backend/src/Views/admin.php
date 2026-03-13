<?php
ob_start();
?>

<section class="max-w-7xl mx-auto px-6 py-16">
    <h1 class="text-4xl font-bold text-white mb-8">Admin Panel</h1>
    <!-- AdminPanel React island mounts here -->
    <div id="admin-panel-root" data-props="{}"></div>
</section>

<?php
$content = ob_get_clean();
require __DIR__ . '/layout.php';
?>