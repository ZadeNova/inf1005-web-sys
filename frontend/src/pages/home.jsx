/**
 * home.jsx — Home Page
 * Owner: CL (Lead)
 * Route: / (index.html)
 * At integration: moves to backend/src/Views/home.php
 */

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '../index.css';

import LocalNav   from '../shared/molecules/LocalNav.jsx';
import AssetCard  from '../shared/molecules/AssetCard.jsx';
import Card       from '../shared/atoms/Card.jsx';
import Button     from '../shared/atoms/Button.jsx';
import PriceChart from '../islands/CL/PriceChart.jsx';

import { mockAssets, mockStats } from '../shared/mockAssets.js';

const saved = localStorage.getItem('vft-theme');
document.documentElement.setAttribute('data-theme',
  ['dark','light','colorblind'].includes(saved) ? saved : 'dark'
);

/* ── Icons ──────────────────────────────────────────────────────────── */
const ArrowRightIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none"
       stroke="currentColor" strokeWidth={2} aria-hidden="true">
    <path d="M5 12h14M12 5l7 7-7 7"/>
  </svg>
);

const TrendUpIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none"
       stroke="currentColor" strokeWidth={2} aria-hidden="true">
    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/>
    <polyline points="17 6 23 6 23 12"/>
  </svg>
);

const ShieldIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none"
       stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
  </svg>
);

const ZapIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none"
       stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
  </svg>
);

const LayersIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none"
       stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
    <polygon points="12 2 2 7 12 12 22 7 12 2"/>
    <polyline points="2 17 12 22 22 17"/>
    <polyline points="2 12 12 17 22 12"/>
  </svg>
);

/* ── Stat Card ──────────────────────────────────────────────────────── */
function StatCard({ label, value, sub, highlight }) {
  return (
    <Card variant="default" padding="md"
          className="flex flex-col gap-1 min-w-0">
      <p className="text-[11px] font-semibold uppercase tracking-widest
                    text-(--color-text-muted)">
        {label}
      </p>
      <p className={`text-2xl font-bold tabular-nums truncate
                     ${highlight
                       ? 'text-(--color-success)'
                       : 'text-(--color-text-primary)'}`}>
        {value}
      </p>
      {sub && (
        <p className="text-xs text-(--color-text-muted)">{sub}</p>
      )}
    </Card>
  );
}

/* ── Feature Pill ───────────────────────────────────────────────────── */
function FeaturePill({ icon, label }) {
  return (
    <div className="flex items-center gap-2 px-4 py-2.5 rounded-full
                    bg-(--color-surface) border border-(--color-border)
                    text-sm text-(--color-text-secondary)">
      <span className="text-(--color-accent)">{icon}</span>
      {label}
    </div>
  );
}

/* ── Section Header ─────────────────────────────────────────────────── */
function SectionHeader({ eyebrow, title, action }) {
  return (
    <div className="flex items-end justify-between mb-6 gap-4">
      <div>
        {eyebrow && (
          <p className="text-[11px] font-semibold uppercase tracking-widest
                        text-(--color-accent) mb-1">
            {eyebrow}
          </p>
        )}
        <h2 className="text-xl font-bold text-(--color-text-primary)">
          {title}
        </h2>
      </div>
      {action && (
        <a href={action.href}
           className="flex items-center gap-1.5 text-sm font-semibold
                      text-(--color-accent) hover:text-(--color-accent-hover)
                      transition-colors shrink-0">
          {action.label}
          <ArrowRightIcon />
        </a>
      )}
    </div>
  );
}

/* ── Main Page ──────────────────────────────────────────────────────── */
function HomePage() {
  return (
    <div className="min-h-screen bg-(--color-bg)">
      <LocalNav />

      <main id="main-content" tabIndex="-1">

        {/* ── 1. HERO ─────────────────────────────────────────────── */}
        <section
          aria-labelledby="hero-heading"
          className="relative overflow-hidden border-b border-(--color-border)"
        >
          {/* Background grid texture */}
          <div className="absolute inset-0 pointer-events-none"
               aria-hidden="true"
               style={{
                 backgroundImage: `
                   linear-gradient(var(--color-border) 1px, transparent 1px),
                   linear-gradient(90deg, var(--color-border) 1px, transparent 1px)
                 `,
                 backgroundSize: '48px 48px',
                 opacity: 0.4,
               }}
          />

          {/* Radial accent glow */}
          <div className="absolute inset-0 pointer-events-none"
               aria-hidden="true"
               style={{
                 background: `radial-gradient(ellipse 60% 50% at 50% 0%,
                   var(--color-accent-glow) 0%, transparent 70%)`,
               }}
          />

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-20 sm:py-28
                          flex flex-col items-center text-center gap-6">

            {/* Eyebrow badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full
                            bg-(--color-accent-subtle) border border-(--color-accent)
                            text-xs font-semibold text-(--color-accent)">
              <span className="w-1.5 h-1.5 rounded-full bg-(--color-accent)
                               animate-pulse" aria-hidden="true" />
              Live Market — 14,823 Active Listings
            </div>

            <h1 id="hero-heading"
                className="text-4xl sm:text-5xl lg:text-6xl font-bold
                           text-(--color-text-primary) max-w-3xl leading-tight">
              Trade Digital Assets
              <span className="block text-(--color-accent)">
                With Confidence
              </span>
            </h1>

            <p className="text-base sm:text-lg text-(--color-text-secondary)
                          max-w-xl leading-relaxed">
              Vapour FT is a peer-to-peer marketplace for rare digital
              collectibles. Atomic transactions, real-time pricing, and
              five rarity tiers — from Common to Secret Rare.
            </p>

            {/* CTA row */}
            <div className="flex flex-wrap items-center justify-center gap-3 mt-2">
              <Button variant="primary" size="lg"
                      icon={<ArrowRightIcon />}>
                <a href="/listings">Browse Market</a>
              </Button>
              <Button variant="secondary" size="lg">
                <a href="/register">Create Account</a>
              </Button>
            </div>

            {/* Feature pills */}
            <div className="flex flex-wrap items-center justify-center gap-2 mt-4">
              <FeaturePill icon={<ShieldIcon />} label="Atomic Transactions" />
              <FeaturePill icon={<ZapIcon />}    label="Real-Time Pricing" />
              <FeaturePill icon={<LayersIcon />} label="5 Rarity Tiers" />
            </div>
          </div>
        </section>

        {/* ── 2. STATS BAR ────────────────────────────────────────── */}
        <section
          aria-label="Market statistics"
          className="border-b border-(--color-border)
                     bg-(--color-surface)"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
              <StatCard
                label="Total Volume"
                value={mockStats.totalVolume}
                sub="All time"
              />
              <StatCard
                label="Active Listings"
                value={mockStats.activeListings.toLocaleString()}
                sub="Right now"
              />
              <StatCard
                label="Registered Users"
                value={mockStats.totalUsers.toLocaleString()}
                sub="And growing"
              />
              <StatCard
                label="Floor Price"
                value={mockStats.floorPrice}
                sub="Lowest listing"
              />
              <StatCard
                label="7-Day Change"
                value={mockStats.weeklyChange}
                sub="Market trend"
                highlight={mockStats.weeklyPositive}
              />
            </div>
          </div>
        </section>

        {/* ── 3. PRICE CHART ──────────────────────────────────────── */}
        <section
          aria-labelledby="chart-heading"
          className="border-b border-(--color-border)"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
            <SectionHeader
              eyebrow="Live Data"
              title="Market Overview"
            />
            {/* React island — mounts from main.jsx in production */}
            <PriceChart />
          </div>
        </section>

        {/* ── 4. FEATURED LISTINGS ────────────────────────────────── */}
        <section
          aria-labelledby="featured-heading"
          className="border-b border-(--color-border)"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
            <SectionHeader
              eyebrow="Hand-picked"
              title="Featured Listings"
              action={{ href: '/listings', label: 'View all listings' }}
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {mockAssets.slice(0, 3).map(asset => (
                <AssetCard
                  key={asset.id}
                  asset={asset}
                  showSeller
                />
              ))}
            </div>
          </div>
        </section>

        {/* ── 5. CTA BANNER ───────────────────────────────────────── */}
        <section aria-labelledby="cta-heading">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
            <Card variant="elevated" padding="lg"
                  className="relative overflow-hidden text-center">
              {/* Glow backdrop */}
              <div className="absolute inset-0 pointer-events-none"
                   aria-hidden="true"
                   style={{
                     background: `radial-gradient(ellipse 70% 80% at 50% 50%,
                       var(--color-accent-glow) 0%, transparent 70%)`,
                   }}
              />
              <div className="relative flex flex-col items-center gap-4">
                <h2 id="cta-heading"
                    className="text-2xl sm:text-3xl font-bold
                               text-(--color-text-primary)">
                  Ready to Start Trading?
                </h2>
                <p className="text-(--color-text-secondary) max-w-md">
                  Join thousands of collectors buying, selling, and trading
                  rare digital assets on Vapour FT.
                </p>
                <div className="flex flex-wrap justify-center gap-3 mt-2">
                  <Button variant="primary" size="lg">
                    <a href="/register">Get Started Free</a>
                  </Button>
                  <Button variant="secondary" size="lg">
                    <a href="/listings">Explore Market</a>
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        </section>

      </main>

      {/* Footer */}
      <footer className="border-t border-(--color-border) px-6 py-8
                         text-center text-(--color-text-muted) text-sm">
        &copy; 2026 Vapour FT. All rights reserved.
      </footer>
    </div>
  );
}

createRoot(document.getElementById('root')).render(
  <StrictMode><HomePage /></StrictMode>
);