/**
 * listings.jsx — Listings Page Prototype Entry
 * Owner: WH (Dev 2)
 * Route: /listings (listings.html)
 * At integration: moves to backend/src/Views/listing.php
 * AVAILABLE ISLANDS (yours to mount):
 *   <ListingsGrid /> ← mounts as  <div id="listings-grid-root">
 *
 * AVAILABLE ATOMS (import from shared):
 *   Card, Button, Badge, Skeleton  ← from '../shared/atoms/...'
 *
 *   the listings page will likely need:
 *   - A page heading (e.g. "Market" or "Browse Listings")
 *   - Optional: a hero/banner strip at the top (collection name, drop info)
 *   - ListingsGrid island — this already includes the asset cards
 *   - FilterBar and Pagination are YOUR TODO inside ListingsGrid.jsx
 */

import { StrictMode }  from 'react';
import { createRoot }  from 'react-dom/client';
import '../index.css';

import LocalNav     from '../shared/molecules/LocalNav.jsx';
import ListingsGrid from '../islands/WH/ListingsGrid.jsx';

const saved = localStorage.getItem('vft-theme');
document.documentElement.setAttribute('data-theme',
  ['dark','light','colorblind'].includes(saved) ? saved : 'dark'
);

function ListingsPage() {
  return (
    <div className="min-h-screen bg-(--color-bg)">
      <LocalNav />
      <main className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-(--color-text-primary) mb-6">
          Market Listings
        </h1>
        <ListingsGrid />
      </main>
    </div>
  );
}

createRoot(document.getElementById('root')).render(
  <StrictMode><ListingsPage /></StrictMode>
);
