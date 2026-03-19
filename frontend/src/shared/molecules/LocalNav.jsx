/**
 * LocalNav.jsx — Local Prototype Only
 * Owner: CL (Lead)
 *
 * Mimics layout.php's nav for local dev. Not used in production.
 *
 * Changes from v1:
 *  - Mock auth state (MOCK_IS_LOGGED_IN flag) — flip to true to test
 *    authenticated nav without a backend session.
 *  - Route-gating: Dashboard + Profile links only show when logged in.
 *    Login / Register buttons hidden when logged in; avatar + logout shown.
 *  - Mobile hamburger menu with aria-expanded / aria-controls.
 *  - ThemeToggle rendered directly (no mountIsland needed here — LocalNav
 *    is already inside a React tree on every page prototype).
 *  - Skip-to-content link for WCAG 2.1 §2.4.1.
 */

import { useState } from 'react';
import ThemeToggle from '../../islands/CL/ThemeToggle.jsx';

/* ─────────────────────────────────────────────────────────────────────────
   MOCK AUTH FLAG
   Flip this to `true` to preview the authenticated nav state locally.
   At integration this whole file is replaced by layout.php, which reads
   $_SESSION['user_id'] server-side — so this flag is dev-only.
   ───────────────────────────────────────────────────────────────────────── */
const MOCK_IS_LOGGED_IN = false;

const MOCK_USER = {
  username:  'vapour_user',
  avatarUrl: null, // set to a URL string to test avatar image
};

/* ─────────────────────────────────────────────────────────────────────────
   NAV LINK DEFINITIONS
   `authRequired: true`  → only shown when MOCK_IS_LOGGED_IN === true
   `authRequired: false` → always shown
   ───────────────────────────────────────────────────────────────────────── */
const NAV_LINKS = [
  { href: '/',          label: 'Home',      authRequired: false },
  { href: '/listings',  label: 'Market',    authRequired: false },
  { href: '/blog',      label: 'News',      authRequired: false },
  { href: '/about',     label: 'About',     authRequired: false },
  { href: '/dashboard', label: 'Dashboard', authRequired: true  },
  { href: '/profile',   label: 'Profile',   authRequired: true  },
];

/* ─────────────────────────────────────────────────────────────────────────
   AVATAR PLACEHOLDER
   Shown when user is logged in but has no avatarUrl.
   Uses first letter of username as initials.
   ───────────────────────────────────────────────────────────────────────── */
function AvatarPlaceholder({ username }) {
  const initial = (username?.[0] ?? '?').toUpperCase();
  return (
    <span
      aria-hidden="true"
      className="w-7 h-7 rounded-full flex items-center justify-center
                 bg-(--color-accent) text-white text-xs font-bold select-none"
    >
      {initial}
    </span>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
   HAMBURGER ICON
   ───────────────────────────────────────────────────────────────────────── */
function HamburgerIcon({ open }) {
  return open ? (
    /* X / close */
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none"
         stroke="currentColor" strokeWidth={2} aria-hidden="true">
      <line x1="18" y1="6"  x2="6"  y2="18"/>
      <line x1="6"  y1="6"  x2="18" y2="18"/>
    </svg>
  ) : (
    /* Hamburger */
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none"
         stroke="currentColor" strokeWidth={2} aria-hidden="true">
      <line x1="3" y1="6"  x2="21" y2="6"/>
      <line x1="3" y1="12" x2="21" y2="12"/>
      <line x1="3" y1="18" x2="21" y2="18"/>
    </svg>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
   LOCAL NAV
   ───────────────────────────────────────────────────────────────────────── */
export default function LocalNav() {
  const current       = window.location.pathname;
  const isLoggedIn    = MOCK_IS_LOGGED_IN;
  const [menuOpen, setMenuOpen] = useState(false);

  /* Filter links by auth gate */
  const visibleLinks = NAV_LINKS.filter(
    ({ authRequired }) => !authRequired || isLoggedIn,
  );

  /* Active-link helper — exact match for /, prefix match for the rest */
  const isActive = (href) =>
    href === '/'
      ? current === '/'
      : current === href || current.startsWith(href + '/');

  return (
    <header className="sticky top-0 z-50 bg-(--color-surface) border-b border-(--color-border)">

      {/* ── Skip-to-content (WCAG 2.4.1) ──────────────────────────────── */}
      <a
        href="#main-content"
        className="
          sr-only focus:not-sr-only
          absolute left-4 top-4
          px-3 py-1.5 rounded-md text-xs font-semibold
          bg-(--color-accent) text-white
          focus-visible:outline-2 focus-visible:outline-offset-2
          focus-visible:outline-(--color-accent)
          z-100
        "
      >
        Skip to content
      </a>

      {/* ── Main nav bar ───────────────────────────────────────────────── */}
      <nav
        aria-label="Main navigation"
        className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between gap-6"
      >

        {/* Logo */}
        <a href="/" className="flex items-center gap-2 shrink-0"
           aria-label="Vapour FT — home">
          <svg className="w-5 h-5 text-(--color-accent)" viewBox="0 0 24 24"
               fill="currentColor" aria-hidden="true">
            <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
          </svg>
          <span className="text-sm font-bold">
            <span className="text-(--color-accent)">Vapour</span> FT
          </span>
        </a>

        {/* Desktop links */}
        <ul className="hidden md:flex items-center gap-5" role="list">
          {visibleLinks.map(({ href, label }) => (
            <li key={href}>
              <a
                href={href}
                aria-current={isActive(href) ? 'page' : undefined}
                className={`text-sm transition-colors ${
                  isActive(href)
                    ? 'text-(--color-accent) font-semibold'
                    : 'text-(--color-text-secondary) hover:text-(--color-text-primary)'
                }`}
              >
                {label}
              </a>
            </li>
          ))}
        </ul>

        {/* Right controls */}
        <div className="flex items-center gap-3">

          {/* Theme toggle — rendered directly; already inside a React tree */}
          <ThemeToggle />

          {isLoggedIn ? (
            /* ── Authenticated state ─────────────────────────────────── */
            <>
              {/* Avatar / username */}
              <a
                href="/profile"
                className="hidden md:flex items-center gap-2
                           text-sm text-(--color-text-secondary)
                           hover:text-(--color-text-primary) transition-colors"
                aria-label={`View profile for ${MOCK_USER.username}`}
              >
                {MOCK_USER.avatarUrl ? (
                  <img
                    src={MOCK_USER.avatarUrl}
                    alt=""
                    className="w-7 h-7 rounded-full object-cover"
                  />
                ) : (
                  <AvatarPlaceholder username={MOCK_USER.username} />
                )}
                <span className="font-medium">{MOCK_USER.username}</span>
              </a>

              {/* Logout (mock — just reloads in prototype) */}
              <a
                href="/logout"
                className="hidden md:inline-flex text-xs font-semibold
                           px-3 py-1.5 rounded-md
                           border border-(--color-border)
                           text-(--color-text-secondary)
                           hover:border-(--color-danger)
                           hover:text-(--color-danger)
                           transition-colors"
              >
                Sign Out
              </a>
            </>
          ) : (
            /* ── Guest state ─────────────────────────────────────────── */
            <>
              <a
                href="/login"
                className="hidden md:inline-flex text-xs font-semibold
                           px-3 py-1.5 rounded-md
                           border border-(--color-border)
                           text-(--color-text-secondary)
                           hover:border-(--color-accent)
                           hover:text-(--color-accent)
                           transition-colors"
              >
                Sign In
              </a>
              <a
                href="/register"
                className="hidden md:inline-flex text-xs font-semibold
                           px-3 py-1.5 rounded-md
                           bg-(--color-accent) text-white
                           hover:bg-(--color-accent-hover)
                           transition-colors"
              >
                Register
              </a>
            </>
          )}

          {/* Mobile hamburger */}
          <button
            type="button"
            className="md:hidden inline-flex items-center justify-center
                       p-2 rounded-md
                       text-(--color-text-secondary)
                       hover:text-(--color-text-primary)
                       hover:bg-(--color-surface-2)
                       transition-colors
                       focus-visible:outline-2
                       focus-visible:outline-(--color-accent)"
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            onClick={() => setMenuOpen((v) => !v)}
          >
            <HamburgerIcon open={menuOpen} />
          </button>
        </div>
      </nav>

      {/* ── Mobile menu drawer ─────────────────────────────────────────── */}
      {menuOpen && (
        <div
          id="mobile-menu"
          role="navigation"
          aria-label="Mobile navigation"
          className="md:hidden border-t border-(--color-border)
                     bg-(--color-surface) px-4 py-3"
        >
          <ul role="list" className="flex flex-col gap-1">
            {visibleLinks.map(({ href, label }) => (
              <li key={href}>
                <a
                  href={href}
                  aria-current={isActive(href) ? 'page' : undefined}
                  className={`block px-3 py-2 rounded-md text-sm transition-colors ${
                    isActive(href)
                      ? 'text-(--color-accent) font-semibold bg-(--color-accent-subtle)'
                      : 'text-(--color-text-secondary) hover:text-(--color-text-primary) hover:bg-(--color-surface-2)'
                  }`}
                  onClick={() => setMenuOpen(false)}
                >
                  {label}
                </a>
              </li>
            ))}
          </ul>

          {/* Mobile auth row */}
          <div className="mt-3 pt-3 border-t border-(--color-border) flex flex-col gap-2">
            {isLoggedIn ? (
              <>
                <a href="/profile"
                   className="flex items-center gap-2 px-3 py-2 rounded-md text-sm
                              text-(--color-text-secondary) hover:bg-(--color-surface-2)
                              transition-colors">
                  {MOCK_USER.avatarUrl ? (
                    <img src={MOCK_USER.avatarUrl} alt=""
                         className="w-6 h-6 rounded-full object-cover"/>
                  ) : (
                    <AvatarPlaceholder username={MOCK_USER.username} />
                  )}
                  <span>{MOCK_USER.username}</span>
                </a>
                <a href="/logout"
                   className="block px-3 py-2 rounded-md text-sm
                              text-(--color-danger) hover:bg-(--color-danger-subtle)
                              transition-colors">
                  Sign Out
                </a>
              </>
            ) : (
              <>
                <a href="/login"
                   className="block px-3 py-2 rounded-md text-sm text-center
                              border border-(--color-border)
                              text-(--color-text-secondary)
                              hover:border-(--color-accent)
                              hover:text-(--color-accent)
                              transition-colors">
                  Sign In
                </a>
                <a href="/register"
                   className="block px-3 py-2 rounded-md text-sm text-center
                              bg-(--color-accent) text-white
                              hover:bg-(--color-accent-hover)
                              transition-colors">
                  Register
                </a>
              </>
            )}
          </div>
        </div>
      )}

      {/* ── Local dev banner ───────────────────────────────────────────── */}
      <div className="bg-(--color-warning-subtle) border-b border-(--color-warning)
                      px-6 py-1 text-center">
        <p className="text-[10px] font-mono text-(--color-warning)">
          LOCAL PROTOTYPE — No backend. All data is mocked.
          {' '}Auth state: <strong>{isLoggedIn ? 'LOGGED IN' : 'GUEST'}</strong>
          {' '}· Flip <code>MOCK_IS_LOGGED_IN</code> in LocalNav.jsx to toggle.
        </p>
      </div>

    </header>
  );
}