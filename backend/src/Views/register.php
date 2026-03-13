<?php
ob_start();
?>

<section class="max-w-md mx-auto px-6 py-16">
    <h1 class="text-3xl font-bold text-white mb-8">Create Account</h1>
    <!-- RegisterForm React island mounts here -->
    <div id="register-form-root" data-props="{}"></div>
</section>

<?php
$content = ob_get_clean();
require __DIR__ . '/layout.php';
?>