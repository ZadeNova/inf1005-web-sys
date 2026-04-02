<?php
/**
 * admin.php — Admin Page View
 * Route:   GET /admin  (AdminMiddleware required)
 */

$csrfToken = $_SESSION['csrf_token'] ?? '';
$userId    = $_SESSION['user_id']    ?? null;

ob_start();
?>

<div class="max-w-7xl mx-auto px-4 sm:px-6 py-8 flex flex-col gap-12">

    <?php /* ── Page heading ────────────────────────────────────── */ ?>
    <div>
        <h1 class="text-2xl font-bold text-(--color-text-primary)">
            Admin Panel
        </h1>
        <p class="text-sm text-(--color-text-muted) mt-1">
            Manage listings, blog posts, and platform content.
        </p>
    </div>

    <?php /* ── Mint New Asset ─────────────────────────────────── */ ?>
    <section aria-labelledby="create-asset-heading">
        <h2 id="create-asset-heading"
            class="text-lg font-semibold text-(--color-text-primary) mb-4">
            Mint New Asset
        </h2>
        <div id="create-asset-form-root"
             data-props='<?= json_encode([
                 'csrfToken' => $csrfToken,
             ], JSON_HEX_APOS | JSON_HEX_QUOT) ?>'>
            <?php /* Skeleton while React hydrates */ ?>
            <div class="rounded-lg border border-(--color-border)
                        bg-(--color-surface) p-6 animate-pulse"
                 aria-hidden="true">
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                    <?php for ($i = 0; $i < 4; $i++): ?>
                    <div class="flex flex-col gap-2">
                        <div class="h-3 w-20 rounded bg-(--color-surface-2)"></div>
                        <div class="h-9 w-full rounded bg-(--color-surface-2)"></div>
                    </div>
                    <?php endfor; ?>
                </div>
                <div class="flex flex-col gap-2 mb-4">
                    <div class="h-3 w-24 rounded bg-(--color-surface-2)"></div>
                    <div class="h-20 w-full rounded bg-(--color-surface-2)"></div>
                </div>
                <div class="h-28 w-full rounded-lg border-2 border-dashed
                            border-(--color-border) bg-(--color-surface-2)"></div>
                <div class="h-9 w-36 rounded bg-(--color-surface-2) mt-4 self-start"></div>
            </div>
        </div>
    </section>

    <?php /* ── Publish Market News ───────────────────────────── */ ?>
    <section aria-labelledby="news-heading">
        <h2 id="news-heading"
            class="text-lg font-semibold text-(--color-text-primary) mb-4">
            Publish Market News
        </h2>
        <div id="create-news-post-root"
             data-props='<?= json_encode([
                 'csrfToken' => $csrfToken,
             ], JSON_HEX_APOS | JSON_HEX_QUOT) ?>'>
            <?php /* Skeleton while React hydrates */ ?>
            <div class="rounded-lg border border-(--color-border)
                        bg-(--color-surface) p-6 animate-pulse"
                 aria-hidden="true">
                <div class="flex flex-col gap-4">
                    <div class="h-4 w-24 rounded bg-(--color-surface-2)"></div>
                    <div class="h-9 w-full rounded bg-(--color-surface-2)"></div>
                    <div class="h-4 w-24 rounded bg-(--color-surface-2)"></div>
                    <div class="h-9 w-48 rounded bg-(--color-surface-2)"></div>
                    <div class="h-4 w-24 rounded bg-(--color-surface-2)"></div>
                    <div class="h-32 w-full rounded bg-(--color-surface-2)"></div>
                    <div class="h-9 w-32 rounded bg-(--color-surface-2) self-end"></div>
                </div>
            </div>
        </div>
    </section>

    <?php /* ── Manage Blog Posts ───────────────────────────────── */ ?>
    <section aria-labelledby="blog-heading">
        <h2 id="blog-heading"
            class="text-lg font-semibold text-(--color-text-primary) mb-4">
            Manage Blog Posts
        </h2>
        <div id="admin-blog-manager-root"
             data-props='<?= json_encode([
                 'csrfToken' => $csrfToken,
             ], JSON_HEX_APOS | JSON_HEX_QUOT) ?>'>
            <?php /* Skeleton while React hydrates */ ?>
            <div class="overflow-x-auto rounded-md border border-(--color-border)
                        animate-pulse" aria-hidden="true">
                <div class="bg-(--color-surface-2) px-4 py-3 flex gap-4">
                    <div class="h-4 w-32 rounded bg-(--color-surface-3)"></div>
                    <div class="h-4 w-24 rounded bg-(--color-surface-3)"></div>
                    <div class="h-4 w-20 rounded bg-(--color-surface-3)"></div>
                    <div class="h-4 w-20 rounded bg-(--color-surface-3) ml-auto"></div>
                </div>
                <?php for ($i = 0; $i < 3; $i++): ?>
                <div class="px-4 py-3 flex gap-4 border-t border-(--color-border)
                            bg-(--color-surface)">
                    <div class="h-4 w-48 rounded bg-(--color-surface-2)"></div>
                    <div class="h-4 w-28 rounded bg-(--color-surface-2)"></div>
                    <div class="h-4 w-20 rounded bg-(--color-surface-2)"></div>
                    <div class="flex gap-2 ml-auto">
                        <div class="h-7 w-14 rounded bg-(--color-surface-2)"></div>
                        <div class="h-7 w-16 rounded bg-(--color-surface-2)"></div>
                    </div>
                </div>
                <?php endfor; ?>
            </div>
        </div>
    </section>

    <?php /* ── Manage Listings ──────────────────────────────── */ ?>
    <section aria-labelledby="listings-heading">
        <h2 id="listings-heading"
            class="text-lg font-semibold text-(--color-text-primary) mb-4">
            Manage Listings
        </h2>
        <div id="admin-listings-manager-root"
             data-props='<?= json_encode([
                 'csrfToken' => $csrfToken,
                 'userId'    => $userId,
             ], JSON_HEX_APOS | JSON_HEX_QUOT) ?>'>
            <?php /* Skeleton while React hydrates */ ?>
            <div class="overflow-x-auto rounded-md border border-(--color-border)
                        animate-pulse" aria-hidden="true">
                <div class="bg-(--color-surface-2) px-4 py-3 flex gap-4">
                    <div class="h-4 w-32 rounded bg-(--color-surface-3)"></div>
                    <div class="h-4 w-20 rounded bg-(--color-surface-3)"></div>
                    <div class="h-4 w-24 rounded bg-(--color-surface-3)"></div>
                    <div class="h-4 w-16 rounded bg-(--color-surface-3)"></div>
                    <div class="h-4 w-16 rounded bg-(--color-surface-3)"></div>
                    <div class="h-4 w-20 rounded bg-(--color-surface-3) ml-auto"></div>
                </div>
                <?php for ($i = 0; $i < 4; $i++): ?>
                <div class="px-4 py-3 flex gap-4 border-t border-(--color-border)
                            bg-(--color-surface)">
                    <div class="h-4 w-40 rounded bg-(--color-surface-2)"></div>
                    <div class="h-5 w-20 rounded-full bg-(--color-surface-2)"></div>
                    <div class="h-4 w-24 rounded bg-(--color-surface-2)"></div>
                    <div class="h-4 w-16 rounded bg-(--color-surface-2)"></div>
                    <div class="h-5 w-16 rounded-full bg-(--color-surface-2)"></div>
                    <div class="flex gap-2 ml-auto">
                        <div class="h-7 w-24 rounded bg-(--color-surface-2)"></div>
                        <div class="h-7 w-16 rounded bg-(--color-surface-2)"></div>
                    </div>
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