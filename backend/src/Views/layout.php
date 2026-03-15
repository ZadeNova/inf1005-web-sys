<?php
// ── Vite manifest reader ──────────────────────────────────────────────────
function viteAsset(string $entry): string
{
    static $manifest = null;
    if ($manifest === null) {
        $manifestPath = __DIR__ . '/../../../public/assets/.vite/manifest.json';
        $manifest = file_exists($manifestPath)
            ? json_decode(file_get_contents($manifestPath), true)
            : [];
    }
    return isset($manifest[$entry])
        ? '/assets/' . $manifest[$entry]['file']
        : '/assets/' . $entry;
}

// ── Theme resolution ──────────────────────────────────────────────────────
$validThemes  = ['dark', 'light', 'colorblind'];
$cookieTheme  = $_COOKIE['vft-theme'] ?? 'dark';
$activeTheme  = in_array($cookieTheme, $validThemes, true) ? $cookieTheme : 'dark';

// ── Nav links ─────────────────────────────────────────────────────────────
// currentPath is injected by PageController via render() $data array.
// Falls back to parsing REQUEST_URI so it always works even if omitted.
$currentPath  = $currentPath ?? strtok($_SERVER['REQUEST_URI'] ?? '/', '?');

$navLinks = [
    ['href' => '/',        'label' => 'Home'],
    ['href' => '/listings','label' => 'Market'],
    ['href' => '/blog',    'label' => 'News'],
    ['href' => '/about',   'label' => 'About'],
];
?>
<!DOCTYPE html>
<html lang="en" data-theme="<?= htmlspecialchars($activeTheme) ?>">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">

    <!-- CSRF token — read by React islands via: document.querySelector('meta[name="csrf-token"]').content -->
    <meta name="csrf-token" content="<?= htmlspecialchars($_SESSION['csrf_token'] ?? '') ?>">

    <title><?= htmlspecialchars($title ?? 'Vapour FT') ?></title>

    <!-- Favicon -->
    <link rel="icon" type="image/svg+xml" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%236366f1'><path d='M13 2L3 14h9l-1 8 10-12h-9l1-8z'/></svg>">

    <!-- Compiled CSS (production) or Vite dev server (local) -->
    <?php if (file_exists(__DIR__ . '/../../../public/assets/.vite/manifest.json')): ?>
        <link rel="stylesheet" href="<?= viteAsset('src/index.css') ?>">
        <script type="module" src="<?= viteAsset('src/main.jsx') ?>"></script>
    <?php else: ?>
        <script type="module" src="http://localhost:3000/@vite/client"></script>
        <link  rel="stylesheet" href="http://localhost:3000/src/index.css">
        <script type="module"   src="http://localhost:3000/src/main.jsx"></script>
    <?php endif; ?>
</head>

<body class="vft-bg vft-text min-h-screen flex flex-col">

    <?php /* ── Skip link (WCAG 2.4.1) ─────────────────────────────── */ ?>
    <a href="#main-content"
       class="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4
              focus:z-[9999] focus:px-4 focus:py-2 focus:rounded-md
              focus:bg-(--color-accent) focus:text-white focus:font-semibold
              focus:text-sm focus:shadow-lg focus:outline-none">
        Skip to main content
    </a>

    <?php /* ── Header + Nav ─────────────────────────────────────────── */ ?>
    <header class="sticky top-0 z-50 vft-surface border-b border-(--color-border)">
        <nav aria-label="Main navigation"
             class="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">

            <?php /* Logo */ ?>
            <a href="/"
               class="flex items-center gap-2 shrink-0 focus-visible:outline-2
                      focus-visible:outline-(--color-accent) focus-visible:outline-offset-2
                      rounded-sm"
               aria-label="Vapour FT — home">
                <svg class="w-5 h-5 text-(--color-accent)" viewBox="0 0 24 24"
                     fill="currentColor" aria-hidden="true">
                    <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
                </svg>
                <span class="text-sm font-bold">
                    <span class="text-(--color-accent)">Vapour</span> FT
                </span>
            </a>

            <?php /* Desktop nav links */ ?>
            <ul role="list"
                class="hidden md:flex items-center gap-1">
                <?php foreach ($navLinks as $link):
                    $isActive = ($link['href'] === '/')
                        ? ($currentPath === '/')
                        : str_starts_with($currentPath, $link['href']);
                ?>
                <li>
                    <a href="<?= htmlspecialchars($link['href']) ?>"
                       <?= $isActive ? 'aria-current="page"' : '' ?>
                       class="px-3 py-1.5 rounded-md text-sm transition-colors
                              focus-visible:outline-2 focus-visible:outline-(--color-accent)
                              focus-visible:outline-offset-2
                              <?= $isActive
                                  ? 'text-(--color-accent) font-semibold bg-(--color-accent-subtle)'
                                  : 'text-(--color-text-secondary) hover:text-(--color-text-primary) hover:bg-(--color-surface-2)'
                              ?>">
                        <?= htmlspecialchars($link['label']) ?>
                    </a>
                </li>
                <?php endforeach; ?>

                <?php /* Auth-gated links */ ?>
                <?php if (isset($_SESSION['user_id'])): ?>
                    <li>
                        <a href="/dashboard"
                           <?= str_starts_with($currentPath, '/dashboard') ? 'aria-current="page"' : '' ?>
                           class="px-3 py-1.5 rounded-md text-sm transition-colors
                                  focus-visible:outline-2 focus-visible:outline-(--color-accent)
                                  focus-visible:outline-offset-2
                                  <?= str_starts_with($currentPath, '/dashboard')
                                      ? 'text-(--color-accent) font-semibold bg-(--color-accent-subtle)'
                                      : 'text-(--color-text-secondary) hover:text-(--color-text-primary) hover:bg-(--color-surface-2)'
                                  ?>">
                            Dashboard
                        </a>
                    </li>
                <?php endif; ?>

                <?php /* Admin link — only for admin role */ ?>
                <?php if (isset($_SESSION['user_id']) && isset($_SESSION['user_role']) && $_SESSION['user_role'] === 'admin'): ?>
                    <li>
                        <a href="/admin"
                           <?= str_starts_with($currentPath, '/admin') ? 'aria-current="page"' : '' ?>
                           class="px-3 py-1.5 rounded-md text-sm transition-colors
                                  focus-visible:outline-2 focus-visible:outline-(--color-accent)
                                  focus-visible:outline-offset-2
                                  <?= str_starts_with($currentPath, '/admin')
                                      ? 'text-(--color-accent) font-semibold bg-(--color-accent-subtle)'
                                      : 'text-(--color-text-secondary) hover:text-(--color-text-primary) hover:bg-(--color-surface-2)'
                                  ?>">
                            Admin
                        </a>
                    </li>
                <?php endif; ?>
            </ul>

            <?php /* Right side: theme toggle + auth CTA */ ?>
            <div class="flex items-center gap-2 shrink-0">

                <?php /* ThemeToggle React island */ ?>
                <div id="theme-toggle-root" data-props="{}"></div>

                <?php if (isset($_SESSION['user_id'])): ?>
                    <a href="/profile"
                       class="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5
                              rounded-md text-xs font-semibold
                              text-(--color-text-secondary) border border-(--color-border)
                              hover:border-(--color-accent) hover:text-(--color-accent)
                              transition-colors focus-visible:outline-2
                              focus-visible:outline-(--color-accent) focus-visible:outline-offset-2">
                        <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none"
                             stroke="currentColor" stroke-width="2" aria-hidden="true">
                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                            <circle cx="12" cy="7" r="4"/>
                        </svg>
                        Profile
                    </a>
                    <form method="POST" action="/api/v1/auth/logout" class="hidden sm:block">
                        <input type="hidden" name="csrf_token"
                               value="<?= htmlspecialchars($_SESSION['csrf_token'] ?? '') ?>">
                        <button type="submit"
                                class="px-3 py-1.5 rounded-md text-xs font-semibold
                                       text-(--color-text-muted) hover:text-(--color-danger)
                                       transition-colors focus-visible:outline-2
                                       focus-visible:outline-(--color-accent)
                                       focus-visible:outline-offset-2">
                            Sign Out
                        </button>
                    </form>
                <?php else: ?>
                    <a href="/login"
                       class="hidden sm:inline-flex px-3 py-1.5 rounded-md text-xs
                              font-semibold text-(--color-text-secondary)
                              border border-(--color-border)
                              hover:border-(--color-accent) hover:text-(--color-accent)
                              transition-colors focus-visible:outline-2
                              focus-visible:outline-(--color-accent) focus-visible:outline-offset-2">
                        Sign In
                    </a>
                    <a href="/register"
                       class="inline-flex px-3 py-1.5 rounded-md text-xs font-semibold
                              text-white bg-(--color-accent)
                              hover:bg-(--color-accent-hover) transition-colors
                              focus-visible:outline-2 focus-visible:outline-(--color-accent)
                              focus-visible:outline-offset-2">
                        Register
                    </a>
                <?php endif; ?>

                <?php /* Mobile hamburger — toggles #mobile-menu */ ?>
                <button type="button"
                        id="mobile-menu-btn"
                        aria-controls="mobile-menu"
                        aria-expanded="false"
                        aria-label="Open navigation menu"
                        class="md:hidden p-2 rounded-md text-(--color-text-secondary)
                               hover:bg-(--color-surface-2) transition-colors
                               focus-visible:outline-2 focus-visible:outline-(--color-accent)
                               focus-visible:outline-offset-2">
                    <svg id="icon-open"  class="w-5 h-5" viewBox="0 0 24 24" fill="none"
                         stroke="currentColor" stroke-width="2" aria-hidden="true">
                        <line x1="3" y1="6"  x2="21" y2="6"/>
                        <line x1="3" y1="12" x2="21" y2="12"/>
                        <line x1="3" y1="18" x2="21" y2="18"/>
                    </svg>
                    <svg id="icon-close" class="w-5 h-5 hidden" viewBox="0 0 24 24" fill="none"
                         stroke="currentColor" stroke-width="2" aria-hidden="true">
                        <line x1="18" y1="6"  x2="6"  y2="18"/>
                        <line x1="6"  y1="6"  x2="18" y2="18"/>
                    </svg>
                </button>
            </div>
        </nav>

        <?php /* Mobile menu drawer */ ?>
        <div id="mobile-menu"
             role="navigation"
             aria-label="Mobile navigation"
             class="hidden md:hidden border-t border-(--color-border)
                    bg-(--color-surface) px-4 py-3">
            <ul role="list" class="flex flex-col gap-1">
                <?php foreach ($navLinks as $link):
                    $isActive = ($link['href'] === '/')
                        ? ($currentPath === '/')
                        : str_starts_with($currentPath, $link['href']);
                ?>
                <li>
                    <a href="<?= htmlspecialchars($link['href']) ?>"
                       <?= $isActive ? 'aria-current="page"' : '' ?>
                       class="block px-3 py-2 rounded-md text-sm transition-colors
                              <?= $isActive
                                  ? 'text-(--color-accent) font-semibold bg-(--color-accent-subtle)'
                                  : 'text-(--color-text-secondary) hover:text-(--color-text-primary) hover:bg-(--color-surface-2)'
                              ?>">
                        <?= htmlspecialchars($link['label']) ?>
                    </a>
                </li>
                <?php endforeach; ?>

                <?php if (isset($_SESSION['user_id'])): ?>
                    <li>
                        <a href="/dashboard"
                           class="block px-3 py-2 rounded-md text-sm
                                  text-(--color-text-secondary)
                                  hover:text-(--color-text-primary)
                                  hover:bg-(--color-surface-2) transition-colors">
                            Dashboard
                        </a>
                    </li>
                    <li>
                        <a href="/profile"
                           class="block px-3 py-2 rounded-md text-sm
                                  text-(--color-text-secondary)
                                  hover:text-(--color-text-primary)
                                  hover:bg-(--color-surface-2) transition-colors">
                            Profile
                        </a>
                    </li>
                <?php else: ?>
                    <li class="pt-2 border-t border-(--color-border) mt-1">
                        <a href="/login"
                           class="block px-3 py-2 rounded-md text-sm
                                  text-(--color-text-secondary)
                                  hover:text-(--color-text-primary)
                                  hover:bg-(--color-surface-2) transition-colors">
                            Sign In
                        </a>
                    </li>
                    <li>
                        <a href="/register"
                           class="block px-3 py-2 rounded-md text-sm font-semibold
                                  text-white bg-(--color-accent)
                                  hover:bg-(--color-accent-hover) transition-colors">
                            Register
                        </a>
                    </li>
                <?php endif; ?>

                <?php if (isset($_SESSION['user_role']) && $_SESSION['user_role'] === 'admin'): ?>
                    <li>
                        <a href="/admin"
                           class="block px-3 py-2 rounded-md text-sm
                                  text-(--color-text-secondary)
                                  hover:text-(--color-text-primary)
                                  hover:bg-(--color-surface-2) transition-colors">
                            Admin
                        </a>
                    </li>
                <?php endif; ?>
            </ul>
        </div>
    </header>

    <?php /* ── Main content ─────────────────────────────────────────── */ ?>
    <main id="main-content" tabindex="-1" class="flex-1">
        <?= $content ?? '' ?>
    </main>

    <?php /* ── Footer ───────────────────────────────────────────────── */ ?>
    <footer aria-label="Site footer"
            class="border-t border-(--color-border) vft-surface mt-auto">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 py-8
                    flex flex-col sm:flex-row items-center justify-between gap-4">

            <?php /* Brand */ ?>
            <div class="flex items-center gap-2">
                <svg class="w-4 h-4 text-(--color-accent)" viewBox="0 0 24 24"
                     fill="currentColor" aria-hidden="true">
                    <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
                </svg>
                <span class="text-sm font-bold">
                    <span class="text-(--color-accent)">Vapour</span> FT
                </span>
            </div>

            <?php /* Footer links */ ?>
            <nav aria-label="Footer navigation">
                <ul role="list" class="flex flex-wrap items-center gap-x-5 gap-y-1
                                        justify-center">
                    <li>
                        <a href="/"
                           class="text-xs text-(--color-text-muted)
                                  hover:text-(--color-text-secondary) transition-colors">
                            Home
                        </a>
                    </li>
                    <li>
                        <a href="/listings"
                           class="text-xs text-(--color-text-muted)
                                  hover:text-(--color-text-secondary) transition-colors">
                            Market
                        </a>
                    </li>
                    <li>
                        <a href="/blog"
                           class="text-xs text-(--color-text-muted)
                                  hover:text-(--color-text-secondary) transition-colors">
                            News
                        </a>
                    </li>
                    <li>
                        <a href="/about"
                           class="text-xs text-(--color-text-muted)
                                  hover:text-(--color-text-secondary) transition-colors">
                            About
                        </a>
                    </li>
                </ul>
            </nav>

            <p class="text-xs text-(--color-text-muted)">
                &copy; <?= date('Y') ?> Vapour FT. All rights reserved.
            </p>
        </div>
    </footer>

    <?php /* ── Mobile menu toggle script ─────────────────────────────
       Minimal vanilla JS — no framework, no build step.
       Runs after DOM is painted (end of body).
    ─────────────────────────────────────────────────────────────── */ ?>
    <script>
        (function () {
            var btn  = document.getElementById('mobile-menu-btn');
            var menu = document.getElementById('mobile-menu');
            var iconOpen  = document.getElementById('icon-open');
            var iconClose = document.getElementById('icon-close');

            if (!btn || !menu) return;

            btn.addEventListener('click', function () {
                var isOpen = menu.classList.toggle('hidden') === false;
                btn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
                btn.setAttribute('aria-label',
                    isOpen ? 'Close navigation menu' : 'Open navigation menu');
                iconOpen.classList.toggle('hidden',  isOpen);
                iconClose.classList.toggle('hidden', !isOpen);
            });

            // Close menu on Escape key
            document.addEventListener('keydown', function (e) {
                if (e.key === 'Escape' && !menu.classList.contains('hidden')) {
                    menu.classList.add('hidden');
                    btn.setAttribute('aria-expanded', 'false');
                    btn.setAttribute('aria-label', 'Open navigation menu');
                    iconOpen.classList.remove('hidden');
                    iconClose.classList.add('hidden');
                    btn.focus();
                }
            });
        })();
    </script>

</body>
</html>