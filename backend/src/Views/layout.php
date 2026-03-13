<?php
// Vite manifest reader — gives us cache-busted asset filenames
function viteAsset(string $entry): string
{
    static $manifest = null;

    if ($manifest === null) {
        $manifestPath = __DIR__ . '/../../../public/assets/.vite/manifest.json';

        if (file_exists($manifestPath)) {
            $manifest = json_decode(file_get_contents($manifestPath), true);
        } else {
            $manifest = [];
        }
    }

    return isset($manifest[$entry])
        ? '/assets/' . $manifest[$entry]['file']
        : '/assets/' . $entry; // Fallback for dev
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">

    <!-- CSRF Token for React island fetch() calls -->
    <meta name="csrf-token" content="<?= htmlspecialchars($_SESSION['csrf_token'] ?? '') ?>">

    <title><?= htmlspecialchars($title ?? 'Vapour FT') ?></title>

    <!-- Compiled CSS from Vite (active once you run npm run build) -->
    <?php if (file_exists(__DIR__ . '/../../../public/assets/.vite/manifest.json')): ?>
        <link rel="stylesheet" href="<?= viteAsset('src/main.css') ?>">
    <?php else: ?>
        <script type="module" src="http://localhost:3000/@vite/client"></script>
        <link rel="stylesheet" href="http://localhost:3000/src/index.css">
        <script type="module" src="http://localhost:3000/src/main.jsx"></script>
    <?php endif; ?>
</head>
<body class="vft-bg vft-text min-h-screen">

    <nav class="vft-surface border-b border-(--color-border) px-6 py-4">
        <div class="max-w-7xl mx-auto flex items-center justify-between">
            <a href="/" class="text-xl font-bold text-(--color-accent)">
                Vapour FT
            </a>
            <ul class="flex gap-6 text-sm">
                <li><a href="/" class="text-(--color-text-secondary) hover:text-(--color-accent) transition-colors">Home</a></li>
                <li><a href="/listings" class="text-(--color-text-secondary) hover:text-(--color-accent) transition-colors">Market</a></li>
                <li><a href="/blog" class="text-(--color-text-secondary) hover:text-(--color-accent) transition-colors">News</a></li>
                <li><a href="/about" class="text-(--color-text-secondary) hover:text-(--color-accent) transition-colors">About</a></li>
                <?php if (isset($_SESSION['user_id'])): ?>
                    <li><a href="/dashboard" class="text-(--color-text-secondary) hover:text-(--color-accent) transition-colors">Dashboard</a></li>
                <?php else: ?>
                    <li><a href="/login" class="text-(--color-text-secondary) hover:text-(--color-accent) transition-colors">Login</a></li>
                    <li><a href="/register" class="text-(--color-text-secondary) hover:text-(--color-accent) transition-colors">Register</a></li>
                <?php endif; ?>
            </ul>
        </div>
    </nav>

    <main>
        <?= $content ?? '' ?>
    </main>

    <footer class="border-t border-(--color-border) px-6 py-8 mt-16 text-center text-(--color-text-muted) text-sm">
        &copy; 2026 Vapour FT. All rights reserved.
    </footer>
</html>