<?php
/**
 * dashboard.php — Dashboard Page View
 * Route:   GET /dashboard  (AuthMiddleware required)
 *
 * Islands mounted here (all must be registered in main.jsx):
 *   #portfolio-chart-root         → PortfolioChart
 *   #rarity-donut-chart-root      → RarityDonutChart        (new island)
 *   #active-listings-manager-root → ActiveListingsManager   (new island)
 *   #activity-feed-root           → ActivityFeed
 *
 * Controller passes via extract($data):
 *   $title      string  — page <title>
 *   $dashStats  array   — keys: username, isVerified, portfolioValue,
 *                         portfolioChange, walletBalance, currency
 */

$username        = $dashStats['username']        ?? ($_SESSION['username'] ?? 'Trader');
$isVerified      = $dashStats['isVerified']      ?? false;
$portfolioValue  = $dashStats['portfolioValue']  ?? null;
$portfolioChange = $dashStats['portfolioChange'] ?? null;
$walletBalance   = $dashStats['walletBalance']   ?? null;
$currency        = $dashStats['currency']        ?? 'VPR';
$userId          = $_SESSION['user_id']          ?? null;

ob_start();
?>

<div class="max-w-6xl mx-auto px-4 sm:px-6 py-8 flex flex-col gap-8">

    <?php /* ── Page heading ────────────────────────────────────── */ ?>
    <div>
        <h1 class="text-2xl font-bold text-(--color-text-primary)">
            My Dashboard
        </h1>
        <p class="text-sm text-(--color-text-muted) mt-1 flex flex-wrap items-center gap-2">
            Welcome back,
            <span class="text-(--color-text-primary) font-semibold">
                <?= htmlspecialchars($username) ?>
            </span>
            <?php if ($isVerified): ?>
            <span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs
                         font-semibold bg-(--color-accent-subtle) text-(--color-accent)
                         border border-(--color-accent)">
                Verified
            </span>
            <?php endif; ?>
        </p>
    </div>

    <?php /* ── My Portfolio section ─────────────────────────── */ ?>
    <section class="flex flex-col gap-4" aria-labelledby="portfolio-heading">
        <h2 id="portfolio-heading"
            class="text-base font-bold text-(--color-text-primary)">
            My Portfolio
        </h2>

        <?php /* Stat cards — 2-col */ ?>
        <dl class="grid grid-cols-1 sm:grid-cols-2 gap-4">

            <div class="rounded-lg border border-(--color-border)
                        bg-(--color-surface) p-4 flex flex-col gap-2">
                <dt class="text-[10px] text-(--color-text-muted) uppercase tracking-wide">
                    Portfolio Value
                </dt>
                <dd class="text-2xl font-bold text-(--color-text-primary) tabular-nums">
                    <?php if ($portfolioValue !== null): ?>
                        <?= htmlspecialchars('$' . number_format((float)$portfolioValue, 0)) ?>
                    <?php else: ?>
                        <span class="inline-block h-8 w-28 rounded bg-(--color-surface-2) animate-pulse"
                              aria-label="Loading"></span>
                    <?php endif; ?>
                </dd>
                <?php if ($portfolioChange !== null): ?>
                <dd class="text-xs text-(--color-success)">
                    <?= htmlspecialchars($portfolioChange) ?>
                </dd>
                <?php endif; ?>
            </div>

            <div class="rounded-lg border border-(--color-border)
                        bg-(--color-surface) p-4 flex flex-col gap-2">
                <dt class="flex items-center gap-2 text-[10px] text-(--color-text-muted) uppercase tracking-wide">
                    <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none"
                         stroke="currentColor" stroke-width="2" aria-hidden="true">
                        <rect x="2" y="5" width="20" height="14" rx="2"/>
                        <path d="M16 12h2"/><path d="M2 10h20"/>
                    </svg>
                    Wallet Balance
                </dt>
                <dd class="text-2xl font-bold text-(--color-accent) tabular-nums">
                    <?php if ($walletBalance !== null): ?>
                        <?= htmlspecialchars('$' . number_format((float)$walletBalance, 2)) ?>
                        <span class="text-xs font-normal text-(--color-text-muted) ml-1">
                            <?= htmlspecialchars($currency) ?>
                        </span>
                    <?php else: ?>
                        <span class="inline-block h-8 w-24 rounded bg-(--color-surface-2) animate-pulse"
                              aria-label="Loading"></span>
                    <?php endif; ?>
                </dd>
            </div>
        </dl>

        <?php /* Chart row: PortfolioChart (2/3) + RarityDonutChart (1/3) */ ?>
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-4">

            <div class="lg:col-span-2">
                <?php /* Island: PortfolioChart — #portfolio-chart-root */ ?>
                <div id="portfolio-chart-root"
                     data-props='<?= json_encode(['userId' => $userId], JSON_HEX_APOS | JSON_HEX_QUOT) ?>'>
                    <div class="rounded-lg border border-(--color-border) bg-(--color-surface)
                                p-4 h-56 animate-pulse" aria-hidden="true"></div>
                </div>
            </div>

            <div>
                <?php /* Island: RarityDonutChart — #rarity-donut-chart-root */ ?>
                <div id="rarity-donut-chart-root"
                     data-props='<?= json_encode(['userId' => $userId], JSON_HEX_APOS | JSON_HEX_QUOT) ?>'>
                    <div class="rounded-lg border border-(--color-border) bg-(--color-surface)
                                p-4 h-56 animate-pulse" aria-hidden="true"></div>
                </div>
            </div>
        </div>
    </section>

    <?php /* ── My Listings section ─────────────────────────── */ ?>
    <section aria-labelledby="listings-heading">
        <h2 id="listings-heading" class="sr-only">My active listings</h2>

        <?php /* Island: ActiveListingsManager — #active-listings-manager-root */ ?>
        <div id="active-listings-manager-root"
             data-props='<?= json_encode([
                 'userId'    => $userId,
                 'csrfToken' => $_SESSION['csrf_token'] ?? '',
             ], JSON_HEX_APOS | JSON_HEX_QUOT) ?>'>
            <div class="flex flex-col gap-3 animate-pulse" aria-hidden="true">
                <?php for ($i = 0; $i < 3; $i++): ?>
                <div class="flex items-center gap-4 p-4 rounded-lg border border-(--color-border) bg-(--color-surface)">
                    <div class="w-14 h-14 rounded-md bg-(--color-surface-2) shrink-0"></div>
                    <div class="flex-1 flex flex-col gap-2">
                        <div class="h-4 w-40 rounded bg-(--color-surface-2)"></div>
                        <div class="h-3 w-20 rounded bg-(--color-surface-2)"></div>
                    </div>
                    <div class="h-8 w-20 rounded-full bg-(--color-surface-2)"></div>
                </div>
                <?php endfor; ?>
            </div>
        </div>
    </section>

    <?php /* ── Recent Activity section ──────────────────────── */ ?>
    <section aria-labelledby="activity-heading">
        <h2 id="activity-heading"
            class="text-base font-bold text-(--color-text-primary) mb-4">
            Recent Activity
        </h2>

        <?php /* Island: ActivityFeed — #activity-feed-root */ ?>
        <div id="activity-feed-root"
             role="region"
             aria-label="Recent trading activity"
             aria-live="polite"
             data-props='<?= json_encode(['userId' => $userId], JSON_HEX_APOS | JSON_HEX_QUOT) ?>'>
            <div class="rounded-lg border border-(--color-border)
                        bg-(--color-surface) p-4 flex flex-col gap-3 animate-pulse"
                 aria-hidden="true">
                <?php for ($i = 0; $i < 5; $i++): ?>
                <div class="flex items-center gap-3 py-3
                            <?= $i < 4 ? 'border-b border-(--color-border)' : '' ?>">
                    <div class="h-5 w-24 rounded-full bg-(--color-surface-2)"></div>
                    <div class="h-4 flex-1 rounded bg-(--color-surface-2)"></div>
                    <div class="h-4 w-12 rounded bg-(--color-surface-2)"></div>
                </div>
                <?php endfor; ?>
            </div>
        </div>
    </section>

</div>

<?php
$content = ob_get_clean();
require __DIR__ . '/layout.php';
?>