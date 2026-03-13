/**
 * home.jsx — Home Page Prototype Entry
 * Owner: CL (Lead)
 * Route: / (index.html)
 * At integration: moves to backend/src/Views/home.php
 */

import { StrictMode }  from 'react';
import { createRoot }  from 'react-dom/client';
import '../index.css';

import LocalNav  from '../shared/molecules/LocalNav.jsx';
import AssetCard from '../shared/molecules/AssetCard.jsx';
import Badge     from '../shared/atoms/Badge.jsx';
import PriceChart from '../islands/CL/PriceChart.jsx';

import { mockAssets, mockStats } from '../shared/mockAssets.js';

const saved = localStorage.getItem('vft-theme');
document.documentElement.setAttribute('data-theme',
  ['dark','light','colorblind'].includes(saved) ? saved : 'dark'
);

function HomePage() {
  return (
    <div className="min-h-screen bg-(--color-bg)] flex flex-col">
      <LocalNav />

      {/* Hero */}
      <section className="max-w-7xl mx-auto px-6 py-20 flex flex-col items-center text-center gap-6">
        <Badge label="🔥 Trending Now" colour="success" />
        <h1 className="text-5xl font-extrabold text-(--color-text-primary)] leading-tight max-w-2xl">
          Trade Digital Collectibles on{' '}
          <span className="text-(--color-accent)]">Vapour FT</span>
        </h1>
        <p className="text-lg text-(--color-text-secondary)] max-w-xl">
          Buy, sell, and trade rare JPG & PNG digital assets. Atomic P2P transactions. No middlemen.
        </p>
        <div className="flex gap-3">
          <a href="/listings" className="px-6 py-3 rounded-(--radius-md)] bg-(--color-accent)] text-white font-semibold text-sm hover:bg-(--color-accent-hover)] transition-colors">
            Browse Market
          </a>
          <a href="/register" className="px-6 py-3 rounded-(--radius-md)] border border-(--color-border)] text-(--color-text-primary)] font-semibold text-sm hover:border-(--color-accent)] hover:text-(--color-accent)] transition-colors">
            Create Account
          </a>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="border-y border-(--color-border)] bg-(--color-surface)]">
        <div className="max-w-7xl mx-auto px-6 py-5 grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { label: 'Total Volume',     value: mockStats.totalVolume },
            { label: 'Active Listings',  value: mockStats.activeListings.toLocaleString() },
            { label: 'Registered Users', value: mockStats.totalUsers.toLocaleString() },
            { label: 'Floor Price',      value: mockStats.floorPrice },
          ].map(({ label, value }) => (
            <div key={label} className="flex flex-col gap-1">
              <p className="text-xl font-bold text-(--color-text-primary)]">{value}</p>
              <p className="text-xs text-(--color-text-muted)] uppercase tracking-wide">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Price Chart Island */}
      <section className="max-w-7xl mx-auto px-6 py-12 w-full">
        <h2 className="text-xl font-bold text-(--color-text-primary)] mb-6">Market Overview</h2>
        <PriceChart />
      </section>

      {/* Featured Cards */}
      <section className="max-w-7xl mx-auto px-6 pb-16 w-full">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-(--color-text-primary)]">Featured Listings</h2>
          <a href="/listings" className="text-sm text-(--color-accent)] hover:text-(--color-accent-hover)]">View all →</a>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {mockAssets.slice(0, 3).map(asset => (
            <AssetCard key={asset.id} asset={asset} onAddToCart={id => console.log('cart:', id)} showSeller />
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-(--color-border)] bg-(--color-surface)] px-6 py-6">
        <div className="max-w-7xl mx-auto text-center text-xs text-(--color-text-muted)]">
          © {new Date().getFullYear()} Vapour FT. All rights reserved.
        </div>
      </footer>
    </div>
  );
}

createRoot(document.getElementById('root')).render(
  <StrictMode><HomePage /></StrictMode>
);
