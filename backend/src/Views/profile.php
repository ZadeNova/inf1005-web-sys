<?php
/**
 * profile.php — Profile Page View
 * Route:   GET /profile  (AuthMiddleware required)
 *
 * Islands mounted here:
 *   #profile-card-root         → ProfileCard
 *   #profile-collections-root  → ProfileCollections
 */

$userId = $_SESSION['user_id'] ?? null;
ob_start();
?>

<div class="max-w-4xl mx-auto px-4 sm:px-6 py-8 flex flex-col gap-6">
    <h1 class="text-2xl font-bold text-(--color-text-primary)">
        My Profile
    </h1>

    <?php /* ── ProfileCard island ─────────────────────────────────── */ ?>
    <div id="profile-card-root"
         data-props='<?= json_encode([
             'userId'        => $userId,
             'currentUserId' => $userId,
         ], JSON_HEX_APOS | JSON_HEX_QUOT) ?>'>
        <?php /* Skeleton while React hydrates */ ?>
        <div class="rounded-lg border border-(--color-border)
                    bg-(--color-surface) p-6 animate-pulse"
             aria-hidden="true">
            <div class="flex items-center gap-4 mb-4">
                <div class="w-14 h-14 rounded-full bg-(--color-surface-2)"></div>
                <div class="flex flex-col gap-2">
                    <div class="h-4 w-32 rounded bg-(--color-surface-2)"></div>
                    <div class="h-3 w-24 rounded bg-(--color-surface-2)"></div>
                </div>
            </div>
            <div class="grid grid-cols-3 gap-3 border-t border-(--color-border) pt-4">
                <?php for ($i = 0; $i < 3; $i++): ?>
                <div class="flex flex-col items-center gap-1">
                    <div class="h-5 w-12 rounded bg-(--color-surface-2)"></div>
                    <div class="h-3 w-16 rounded bg-(--color-surface-2)"></div>
                </div>
                <?php endfor; ?>
            </div>
        </div>
    </div>

    <?php /* ── ProfileCollections island ──────────────────────────── */ ?>
    <div id="profile-collections-root"
         data-props='<?= json_encode([
             'userId' => $userId,
         ], JSON_HEX_APOS | JSON_HEX_QUOT) ?>'>
        <?php /* Skeleton while React hydrates */ ?>
        <div class="flex flex-col gap-4 animate-pulse" aria-hidden="true">
            <div class="rounded-lg border border-(--color-border)
                        bg-(--color-surface) p-4">
                <div class="h-4 w-28 rounded bg-(--color-surface-2) mb-3"></div>
                <div class="flex gap-2">
                    <?php for ($i = 0; $i < 3; $i++): ?>
                    <div class="h-6 w-20 rounded-full bg-(--color-surface-2)"></div>
                    <?php endfor; ?>
                </div>
            </div>
            <div class="rounded-lg border border-(--color-border)
                        bg-(--color-surface) p-4">
                <div class="h-4 w-36 rounded bg-(--color-surface-2) mb-3"></div>
                <div class="flex items-center gap-4">
                    <div class="w-16 h-16 rounded-md bg-(--color-surface-2)"></div>
                    <div class="flex flex-col gap-2">
                        <div class="h-4 w-32 rounded bg-(--color-surface-2)"></div>
                        <div class="h-3 w-24 rounded bg-(--color-surface-2)"></div>
                    </div>
                </div>
            </div>
            <div class="rounded-lg border border-(--color-border)
                        bg-(--color-surface) p-4">
                <div class="flex gap-4 border-b border-(--color-border) mb-4">
                    <?php for ($i = 0; $i < 2; $i++): ?>
                    <div class="h-8 w-28 rounded bg-(--color-surface-2)"></div>
                    <?php endfor; ?>
                </div>
                <div class="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    <?php for ($i = 0; $i < 6; $i++): ?>
                    <div class="rounded-lg border border-(--color-border)
                                bg-(--color-surface-2) p-3 flex flex-col gap-2">
                        <div class="w-full aspect-square rounded bg-(--color-surface)"></div>
                        <div class="h-3 w-3/4 rounded bg-(--color-surface)"></div>
                        <div class="h-3 w-1/2 rounded bg-(--color-surface)"></div>
                    </div>
                    <?php endfor; ?>
                </div>
            </div>
        </div>
    </div>

</div>

<?php
$content = ob_get_clean();
require __DIR__ . '/layout.php';
?>