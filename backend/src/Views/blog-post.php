<?php ob_start(); ?>

<article class="max-w-3xl mx-auto px-4 sm:px-6 py-12">

  <a href="/blog" class="text-sm text-(--color-accent) hover:underline mb-6 inline-block">
    ← Back to Blog
  </a>

  <header class="mb-8">
    <div class="flex items-center gap-3 mb-4">
      <span class="text-xs font-semibold uppercase tracking-widest 
                   text-(--color-accent) bg-(--color-surface-2) 
                   border border-(--color-border) px-3 py-1 rounded-full">
        <?= htmlspecialchars($post['category']) ?>
      </span>
      <time class="text-xs text-(--color-text-muted)" 
            datetime="<?= htmlspecialchars($post['created_at']) ?>">
        <?= date('M j, Y', strtotime($post['created_at'])) ?>
      </time>
    </div>
    <h1 class="text-3xl font-bold text-(--color-text-primary) leading-tight mb-3">
      <?= htmlspecialchars($post['title']) ?>
    </h1>
    <p class="text-sm text-(--color-text-muted)">
      By <?= htmlspecialchars($post['author']) ?>
    </p>
  </header>

  <div class="prose prose-invert max-w-none text-(--color-text-secondary) 
              leading-relaxed text-sm whitespace-pre-line">
    <?= htmlspecialchars($post['body']) ?>
  </div>

</article>

<?php
$content = ob_get_clean();
require __DIR__ . '/layout.php';
?>