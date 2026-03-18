<?php
/**
 * login.php — Login Page View
 * Route:   GET /login
 * Islands: LoginForm → #login-form-root
 * Auth:    Public (redirect to /dashboard if already logged in)
 */

/* Redirect already-authenticated users */
if (isset($_SESSION['user_id'])) {
    header('Location: /dashboard');
    exit;
}

ob_start();
?>

<div class="flex flex-col flex-1 items-center justify-center
            px-4 py-10 sm:py-16
            min-h-[calc(100vh-4rem)]">

    <div class="w-full max-w-md flex flex-col items-center gap-8">

        <?php /* ── Brand header ──────────────────────────────────── */ ?>
        <div class="text-center">
            <a href="/" aria-label="Vapour FT — home">
                <p class="text-3xl font-bold text-(--color-text-primary) tracking-tight">
                    Vapour<span class="text-(--color-accent)">FT</span>
                </p>
            </a>
            <p class="text-sm text-(--color-text-secondary) mt-1">
                Sign in to your account
            </p>
        </div>

        <?php /* ── LoginForm React island ───────────────────────── */ ?>
        <div id="login-form-root"
             class="w-full"
             data-props='<?= json_encode([
                 "csrfToken" => $_SESSION["csrf_token"] ?? "",
             ], JSON_HEX_APOS | JSON_HEX_QUOT) ?>'>
            <?php /* Accessible no-JS fallback */ ?>
            <noscript>
                <div class="rounded-lg border border-(--color-border)
                            bg-(--color-surface) p-6"
                     role="alert">
                    <p class="text-sm text-(--color-text-secondary) text-center">
                        JavaScript is required to use the login form.
                        Please enable JavaScript and reload the page.
                    </p>
                </div>
            </noscript>
        </div>

        <?php /* ── Register crosslink ───────────────────────────── */ ?>
        <p class="text-sm text-(--color-text-muted)">
            Don't have an account?
            <a href="/register"
               class="text-(--color-accent) hover:text-(--color-accent-hover)
                      font-medium transition-colors
                      focus-visible:outline-2 focus-visible:outline-(--color-accent)
                      focus-visible:outline-offset-2 rounded-sm">
                Create one
            </a>
        </p>

    </div>
</div>

<?php
$content = ob_get_clean();
require __DIR__ . '/layout.php';
?>