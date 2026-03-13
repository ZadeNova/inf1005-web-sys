/**
 * LocalNav.jsx — Local Prototype Only
 * A shared nav bar used by all page entry points during local dev.
 * Mimics layout.php's nav so pages look complete without the backend.
 * Not used in production — layout.php replaces this at integration.
 */

import { useTheme } from '../hooks/useTheme.js';
import ThemeToggle  from '../../islands/CL/ThemeToggle.jsx';

const NAV_LINKS = [
  { href: '/',          label: 'Home' },
  { href: '/listings',  label: 'Market' },
  { href: '/community', label: 'Community' },
  { href: '/blog',      label: 'News' },
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/profile',   label: 'Profile' },
];

export default function LocalNav() {
  const current = window.location.pathname;

  return (
    <header className="sticky top-0 z-50 bg-(--color-surface) border-b border-(--color-border)]">
      <nav className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between gap-6">

        {/* Logo */}
        <a href="/" className="flex items-center gap-2 shrink-0">
          <svg className="w-5 h-5 text-(--color-accent)]" viewBox="0 0 24 24" fill="currentColor">
            <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
          </svg>
          <span className="text-sm font-bold">
            <span className="text-(--color-accent)]">Vapour</span> FT
          </span>
        </a>

        {/* Links */}
        <ul className="hidden md:flex items-center gap-5">
          {NAV_LINKS.map(({ href, label }) => {
            const isActive = current === href || (href !== '/' && current.startsWith(href));
            return (
              <li key={href}>
                <a
                  href={href}
                  className={`text-sm transition-colors ${
                    isActive
                      ? 'text-(--color-accent)] font-semibold'
                      : 'text-(--color-text-secondary)] hover:text-(--color-text-primary)]'
                  }`}
                >
                  {label}
                </a>
              </li>
            );
          })}
        </ul>

        {/* Right controls */}
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <a
            href="/login"
            className="text-xs font-semibold px-3 py-1.5 rounded-(--radius-md)] bg-(--color-accent)] text-white hover:bg-(--color-accent-hover)] transition-colors"
          >
            Sign In
          </a>
        </div>
      </nav>

      {/* Local dev banner */}
      <div className="bg-(--color-warning-subtle)] border-b border-(--color-warning)] px-6 py-1 text-center">
        <p className="text-[10px] font-mono text-(--color-warning)">
          LOCAL PROTOTYPE — No backend. All data is mocked. Theme toggle is live.
        </p>
      </div>
    </header>
  );
}
