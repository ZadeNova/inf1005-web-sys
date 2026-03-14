<?php
ob_start();
?>

<section class="max-w-md mx-auto px-6 py-16">
    <h1 class="text-3xl font-bold text-white mb-8">Login</h1>
    <!-- LoginForm React island mounts here -->
    <!--Pass CSRF token as a prop to the React component-->
    <div id="login-form-root" data-props='<?= json_encode([
    "csrfToken" => $_SESSION["csrf_token"] ?? "",
    ], JSON_HEX_APOS | JSON_HEX_QUOT) ?>'></div>
</section>

<?php
$content = ob_get_clean();
require __DIR__ . '/layout.php';
?>