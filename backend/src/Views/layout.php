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
    <!-- TEMPORARY: Remove once Vite dev server CSS is fixed -->
    <script src="https://cdn.tailwindcss.com"></script>
    <!-- Compiled CSS from Vite (active once you run npm run build) -->
    <?php if (file_exists(__DIR__ . '/../../../public/assets/.vite/manifest.json')): ?>
        <link rel="stylesheet" href="<?= viteAsset('src/main.css') ?>">
    <?php else: ?>
        <script type="module" src="http://localhost:3000/@vite/client"></script>
        <script type="module" src="http://localhost:3000/src/main.jsx"></script>
    <?php endif; ?>
</head>
<body class="bg-gray-950 text-gray-100 min-h-screen">

    <!-- Navigation -->
    <nav class="bg-gray-900 border-b border-gray-800 px-6 py-4">
        <div class="max-w-7xl mx-auto flex items-center justify-between">
            <a href="/" class="text-xl font-bold text-indigo-400">
                Vapour FT
            </a>
            <ul class="flex gap-6 text-sm">
                <li><a href="/" class="hover:text-indigo-400">Home</a></li>
                <li><a href="/listings" class="hover:text-indigo-400">Market</a></li>
                <li><a href="/blog" class="hover:text-indigo-400">News</a></li>
                <li><a href="/about" class="hover:text-indigo-400">About</a></li>
                <?php if (isset($_SESSION['user_id'])): ?>
                    <li><a href="/dashboard" class="hover:text-indigo-400">Dashboard</a></li>
                    <li><a href="/profile" class="hover:text-indigo-400">Profile</a></li>
                <?php else: ?>
                    <li><a href="/login" class="hover:text-indigo-400">Login</a></li>
                    <li><a href="/register" class="hover:text-indigo-400">Register</a></li>
                <?php endif; ?>
            </ul>
        </div>
    </nav>

    <!-- Page Content injected here -->
    <main>
        <?= $content ?? '' ?>
    </main>

    <!-- Footer -->
    <footer class="bg-gray-900 border-t border-gray-800 px-6 py-8 mt-16">
        <div class="max-w-7xl mx-auto text-center text-gray-500 text-sm">
            © <?= date('Y') ?> Vapour FT. All rights reserved.
        </div>
    </footer>

</body>
</html>