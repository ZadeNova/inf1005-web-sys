<?php
ob_start();

/* ── Team members ──────────────────────────────────────────────────────
   Update names/roles to match your actual team before submission.
   ─────────────────────────────────────────────────────────────────── */
$team = [
    [
        'name'     => 'Chee Long',
        'role'     => 'Frontend Lead',
        'bio'      => 'Owns the React island registry, shared component library, Home and Admin pages, Responsible for the final frontend deliverables',
    ],
    [
        'name'     => 'Dev 1',
        'role'     => 'Authentication & Blog',
        'bio'      => 'Builds Login, Register, and Blog pages with full form validation and session handling.',
    ],
    [
        'name'     => 'Dev 2',
        'role'     => 'Dashboard & Listings',
        'bio'      => 'Owns the market browser, user dashboard, portfolio charts, and activity feed.',
    ],
    [
        'name'     => 'Backend Lead',
        'role'     => 'API & Database',
        'bio'      => 'Designs the PHP Slim REST API, MySQL schema, and atomic transaction layer.',
    ],
    [
        'name'     => 'Infrastructure',
        'role'     => 'DevOps & Deployment',
        'bio'      => 'Manages Docker, Nginx, GCP deployment, and CI/CD pipeline.',
    ],
];

/* ── Platform features ─────────────────────────────────────────────── */
$features = [
    [
        'icon'  => '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>',
        'title' => 'Atomic Transactions',
        'desc'  => 'Every trade is all-or-nothing. No partial fills, no lost assets — your balance and ownership update together or not at all.',
    ],
    [
        'icon'  => '<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>',
        'title' => '5 Rarity Tiers',
        'desc'  => 'From Common to Secret Rare, every asset has a verified rarity tier. Colourblind-safe symbols ensure no information is lost.',
    ],
    [
        'icon'  => '<polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/>',
        'title' => 'Real-Time Pricing',
        'desc'  => 'Floor prices and collection charts update live. Make informed decisions with historical data going back 12 months.',
    ],
    [
        'icon'  => '<path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/>',
        'title' => 'Condition Grading',
        'desc'  => 'Assets are graded Mint through Heavily Played. Condition is factored into every listing so you always know what you\'re buying.',
    ],
    [
        'icon'  => '<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',
        'title' => 'Peer-to-Peer Trading',
        'desc'  => 'List, make offers, accept or counter — all directly between users. No middleman taking a cut beyond the platform fee.',
    ],
    [
        'icon'  => '<rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>',
        'title' => 'Secure by Default',
        'desc'  => 'PHP-Auth session management, CSRF tokens on every mutation, and soft-delete with a 30-day grace period for account safety.',
    ],
];

/* ── Tech stack ────────────────────────────────────────────────────── */
$stack = [
    ['label' => 'React 19',      'sub' => 'Islands Architecture'],
    ['label' => 'PHP Slim 4',    'sub' => 'REST API'],
    ['label' => 'MySQL 8',       'sub' => 'Database'],
    ['label' => 'Tailwind v4',   'sub' => 'Design System'],
    ['label' => 'Docker',        'sub' => 'Containerised'],
    ['label' => 'GCP',           'sub' => 'Deployment'],
];
?>

<?php /* ── Skip link (accessibility) ─────────────────────────────── */ ?>
<a href="#main-content"
   class="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4
          focus:z-50 focus:px-4 focus:py-2 focus:rounded-md
          focus:bg-(--color-accent) focus:text-white focus:font-semibold
          focus:shadow-lg">
    Skip to main content
</a>

<main id="main-content" tabindex="-1" class="vft-bg">

    <?php /* ══════════════════════════════════════════════════════════
       HERO
    ══════════════════════════════════════════════════════════════ */ ?>
    <section aria-labelledby="about-heading"
             class="relative overflow-hidden border-b border-(--color-border)">

        <?php /* Grid texture */ ?>
        <div class="absolute inset-0 pointer-events-none opacity-40"
             aria-hidden="true"
             style="
                background-image:
                    linear-gradient(var(--color-border) 1px, transparent 1px),
                    linear-gradient(90deg, var(--color-border) 1px, transparent 1px);
                background-size: 48px 48px;
             ">
        </div>

        <?php /* Radial glow */ ?>
        <div class="absolute inset-0 pointer-events-none"
             aria-hidden="true"
             style="background: radial-gradient(ellipse 60% 50% at 50% 0%,
                    var(--color-accent-glow) 0%, transparent 70%);">
        </div>

        <div class="relative max-w-7xl mx-auto px-4 sm:px-6 py-20 sm:py-28
                    text-center flex flex-col items-center gap-6">

            <div class="inline-flex items-center gap-2 px-3 py-1.5 rounded-full
                        bg-(--color-accent-subtle) border border-(--color-accent)
                        text-xs font-semibold text-(--color-accent)">
                Year 1 Web Systems Project
            </div>

            <h1 id="about-heading"
                class="text-4xl sm:text-5xl font-bold text-(--color-text-primary)
                       max-w-2xl leading-tight">
                Built by Students,
                <span class="block text-(--color-accent)">Engineered Like Production</span>
            </h1>

            <p class="text-base sm:text-lg text-(--color-text-secondary)
                      max-w-xl leading-relaxed">
                Vapour FT is a digital asset marketplace built as a Year 1
                university web systems project. Five developers. Three weeks.
                One production-grade platform.
            </p>
        </div>
    </section>

    <?php /* ══════════════════════════════════════════════════════════
       MISSION
    ══════════════════════════════════════════════════════════════ */ ?>
    <section aria-labelledby="mission-heading"
             class="border-b border-(--color-border)">
        <div class="max-w-4xl mx-auto px-4 sm:px-6 py-16 text-center">

            <p class="text-[11px] font-semibold uppercase tracking-widest
                      text-(--color-accent) mb-3">
                Our Mission
            </p>
            <h2 id="mission-heading"
                class="text-2xl sm:text-3xl font-bold text-(--color-text-primary) mb-6">
                A marketplace worth trading on
            </h2>
            <p class="text-base text-(--color-text-secondary) leading-relaxed max-w-2xl mx-auto">
                We set out to build what we'd actually want to use — a clean,
                fast, trustworthy place to buy and sell rare digital collectibles.
                No mystery fees, no broken transactions, no colour-coded rarity
                that falls apart if you're colourblind. Just a well-engineered
                platform with real engineering patterns under the hood.
            </p>
        </div>
    </section>

    <?php /* ══════════════════════════════════════════════════════════
       HOW IT WORKS — 3-step flow
    ══════════════════════════════════════════════════════════════ */ ?>
    <section aria-labelledby="how-heading"
             class="border-b border-(--color-border) bg-(--color-surface)">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 py-16">

            <div class="text-center mb-12">
                <p class="text-[11px] font-semibold uppercase tracking-widest
                          text-(--color-accent) mb-3">
                    The Process
                </p>
                <h2 id="how-heading"
                    class="text-2xl sm:text-3xl font-bold text-(--color-text-primary)">
                    How it works
                </h2>
            </div>

            <ol class="grid grid-cols-1 md:grid-cols-3 gap-0 relative"
                role="list">

                <?php
                $steps = [
                    [
                        'n'     => '01',
                        'title' => 'Browse the Market',
                        'desc'  => 'Filter thousands of listings by collection, rarity, condition, and price. Every asset has verified metadata and price history.',
                        'icon'  => '<circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>',
                    ],
                    [
                        'n'     => '02',
                        'title' => 'Make Your Move',
                        'desc'  => 'Buy instantly at the listed price, or send the seller a counter-offer. All offers are binding — no lowball spam.',
                        'icon'  => '<line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>',
                    ],
                    [
                        'n'     => '03',
                        'title' => 'Collect & Trade',
                        'desc'  => 'Your portfolio updates instantly. Track your collection\'s value over time, list assets you no longer want, and repeat.',
                        'icon'  => '<polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/>',
                    ],
                ];
                foreach ($steps as $i => $step):
                    $isLast = $i === count($steps) - 1;
                ?>
                <li class="relative flex flex-col items-center text-center px-6 py-8
                            <?= !$isLast ? 'md:border-r border-(--color-border)' : '' ?>">

                    <?php /* Step number */ ?>
                    <div class="w-14 h-14 rounded-full bg-(--color-accent-subtle)
                                border border-(--color-accent) flex items-center
                                justify-center mb-4 shrink-0">
                        <svg class="w-6 h-6 text-(--color-accent)"
                             viewBox="0 0 24 24" fill="none"
                             stroke="currentColor" stroke-width="1.5"
                             aria-hidden="true">
                            <?= $step['icon'] ?>
                        </svg>
                    </div>

                    <span class="text-[10px] font-mono font-bold
                                 text-(--color-text-muted) tracking-widest mb-2">
                        STEP <?= htmlspecialchars($step['n']) ?>
                    </span>

                    <h3 class="text-base font-bold text-(--color-text-primary) mb-2">
                        <?= htmlspecialchars($step['title']) ?>
                    </h3>
                    <p class="text-sm text-(--color-text-secondary) leading-relaxed">
                        <?= htmlspecialchars($step['desc']) ?>
                    </p>
                </li>
                <?php endforeach; ?>
            </ol>
        </div>
    </section>

    <?php /* ══════════════════════════════════════════════════════════
       PLATFORM FEATURES — 2×3 grid
    ══════════════════════════════════════════════════════════════ */ ?>
    <section aria-labelledby="features-heading"
             class="border-b border-(--color-border)">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 py-16">

            <div class="text-center mb-12">
                <p class="text-[11px] font-semibold uppercase tracking-widest
                          text-(--color-accent) mb-3">
                    Platform
                </p>
                <h2 id="features-heading"
                    class="text-2xl sm:text-3xl font-bold text-(--color-text-primary)">
                    Everything you need to trade
                </h2>
            </div>

            <ul class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
                role="list">
                <?php foreach ($features as $feature): ?>
                <li class="bg-(--color-surface) border border-(--color-border)
                            rounded-lg p-6 flex flex-col gap-3
                            hover:border-(--color-accent)
                            transition-colors duration-200">

                    <div class="w-10 h-10 rounded-md bg-(--color-accent-subtle)
                                flex items-center justify-center shrink-0">
                        <svg class="w-5 h-5 text-(--color-accent)"
                             viewBox="0 0 24 24" fill="none"
                             stroke="currentColor" stroke-width="1.5"
                             aria-hidden="true">
                            <?= $feature['icon'] ?>
                        </svg>
                    </div>

                    <h3 class="text-sm font-bold text-(--color-text-primary)">
                        <?= htmlspecialchars($feature['title']) ?>
                    </h3>
                    <p class="text-sm text-(--color-text-secondary) leading-relaxed">
                        <?= htmlspecialchars($feature['desc']) ?>
                    </p>
                </li>
                <?php endforeach; ?>
            </ul>
        </div>
    </section>

    <?php /* ══════════════════════════════════════════════════════════
       TEAM
    ══════════════════════════════════════════════════════════════ */ ?>
    <section aria-labelledby="team-heading"
             class="border-b border-(--color-border) bg-(--color-surface)">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 py-16">

            <div class="text-center mb-12">
                <p class="text-[11px] font-semibold uppercase tracking-widest
                          text-(--color-accent) mb-3">
                    The Team
                </p>
                <h2 id="team-heading"
                    class="text-2xl sm:text-3xl font-bold text-(--color-text-primary)">
                    Five developers, one codebase
                </h2>
                <p class="mt-3 text-sm text-(--color-text-secondary) max-w-lg mx-auto">
                    Each team member owns a vertical slice of the stack —
                    clear boundaries, no merge conflicts.
                </p>
            </div>

            <ul class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5
                       gap-4"
                role="list">
                <?php foreach ($team as $member): ?>
                <li class="bg-(--color-surface-2) border border-(--color-border)
                            rounded-lg p-5 flex flex-col items-center
                            text-center gap-3">

                    <?php /* Initials avatar */ ?>
                    <div class="w-12 h-12 rounded-full bg-(--color-accent-subtle)
                                border-2 border-(--color-accent)
                                flex items-center justify-center shrink-0"
                         aria-hidden="true">
                        <span class="text-sm font-bold text-(--color-accent)">
                            <?= htmlspecialchars($member['initials']) ?>
                        </span>
                    </div>

                    <div>
                        <p class="text-sm font-bold text-(--color-text-primary)">
                            <?= htmlspecialchars($member['name']) ?>
                        </p>
                        <p class="text-[11px] font-semibold text-(--color-accent) mt-0.5">
                            <?= htmlspecialchars($member['role']) ?>
                        </p>
                    </div>

                    <p class="text-xs text-(--color-text-secondary) leading-relaxed">
                        <?= htmlspecialchars($member['bio']) ?>
                    </p>
                </li>
                <?php endforeach; ?>
            </ul>
        </div>
    </section>

    <?php /* ══════════════════════════════════════════════════════════
       TECH STACK
    ══════════════════════════════════════════════════════════════ */ ?>
    <section aria-labelledby="stack-heading"
             class="border-b border-(--color-border)">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 py-12">

            <p id="stack-heading"
               class="text-center text-[11px] font-semibold uppercase
                      tracking-widest text-(--color-text-muted) mb-8">
                Built with
            </p>

            <ul class="flex flex-wrap justify-center gap-3" role="list">
                <?php foreach ($stack as $tech): ?>
                <li class="flex flex-col items-center px-5 py-3
                            bg-(--color-surface) border border-(--color-border)
                            rounded-lg min-w-[100px]">
                    <span class="text-sm font-bold text-(--color-text-primary)">
                        <?= htmlspecialchars($tech['label']) ?>
                    </span>
                    <span class="text-[10px] text-(--color-text-muted) mt-0.5">
                        <?= htmlspecialchars($tech['sub']) ?>
                    </span>
                </li>
                <?php endforeach; ?>
            </ul>
        </div>
    </section>

    <?php /* ══════════════════════════════════════════════════════════
       CTA BANNER
    ══════════════════════════════════════════════════════════════ */ ?>
    <section aria-labelledby="cta-heading">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 py-16">

            <div class="relative overflow-hidden bg-(--color-surface)
                        border border-(--color-border) rounded-xl p-8 sm:p-12
                        text-center">

                <?php /* Glow backdrop */ ?>
                <div class="absolute inset-0 pointer-events-none"
                     aria-hidden="true"
                     style="background: radial-gradient(ellipse 70% 80% at 50% 50%,
                            var(--color-accent-glow) 0%, transparent 70%);">
                </div>

                <div class="relative flex flex-col items-center gap-4">
                    <h2 id="cta-heading"
                        class="text-2xl sm:text-3xl font-bold
                               text-(--color-text-primary)">
                        Ready to start collecting?
                    </h2>
                    <p class="text-(--color-text-secondary) max-w-md">
                        Browse thousands of listings or list your own assets
                        in under a minute.
                    </p>

                    <div class="flex flex-wrap justify-center gap-3 mt-2">
                        <a href="/register"
                           class="inline-flex items-center gap-2 px-6 py-3
                                  rounded-md text-sm font-semibold text-white
                                  bg-(--color-accent) hover:bg-(--color-accent-hover)
                                  transition-colors focus-visible:outline-2
                                  focus-visible:outline-(--color-accent)
                                  focus-visible:outline-offset-2">
                            Create Free Account
                            <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none"
                                 stroke="currentColor" stroke-width="2"
                                 aria-hidden="true">
                                <path d="M5 12h14M12 5l7 7-7 7"/>
                            </svg>
                        </a>
                        <a href="/listings"
                           class="inline-flex items-center gap-2 px-6 py-3
                                  rounded-md text-sm font-semibold
                                  text-(--color-text-primary)
                                  bg-transparent border border-(--color-border)
                                  hover:border-(--color-accent)
                                  hover:text-(--color-accent)
                                  transition-colors focus-visible:outline-2
                                  focus-visible:outline-(--color-accent)
                                  focus-visible:outline-offset-2">
                            Explore Market
                        </a>
                    </div>
                </div>
            </div>
        </div>
    </section>

</main>

<?php
$content = ob_get_clean();
require __DIR__ . '/layout.php';
?>