/**
 * profile.jsx — Profile Page Prototype Entry
 * Owner: WH (Dev 2)
 * Route: /profile (profile.html)
 * At integration: moves to backend/src/Views/profile.php
 * 
 * AVAILABLE ISLANDS (yours to mount):
 *   <ProfileCard userId="user-001" /> ← mounts as  <div id="profile-card-root">
 *
 * AVAILABLE MOLECULES + ATOMS (import from shared):
 *   AssetCard  ← from '../shared/molecules/AssetCard.jsx'  (for owned assets grid)
 *   Card, Button, Badge, Skeleton  ← from '../shared/atoms/...'
 *
 * MOCK DATA (already available):
 *   mockAssets  ← use this to render a mock "Owned Assets" grid below the ProfileCard
 *
 *     the profile page will likely need:
 *   - ProfileCard island at the top (user avatar, bio, stats)
 *   - A section below for "Owned Assets" — use mockAssets + <AssetCard compact />
 *   - Optional: tabs for "Owned", "Listed", "Transaction History"
 */

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '../index.css';

import LocalNav   from '../shared/molecules/LocalNav.jsx';
import ProfileCard from '../islands/WH/ProfileCard.jsx';
import AssetCard        from '../shared/molecules/AssetCard.jsx';
import Card             from '../shared/atoms/Card.jsx';
import Button           from '../shared/atoms/Button.jsx';
import Badge            from '../shared/atoms/Badge.jsx';
import { mockAssets }   from '../shared/mockAssets.js';

const saved = localStorage.getItem('vft-theme');
document.documentElement.setAttribute('data-theme',
  ['dark','light','colorblind'].includes(saved) ? saved : 'dark'
);

function ProfilePage() {
  return (
    <div className="min-h-screen bg-(--color-bg)">

      {/* Navigation bar */}
      <LocalNav />

      {/* Main content */}
      <main className="max-w-4xl mx-auto px-4 py-8">

        {/* Profile Card island */}
        <ProfileCard userId="user-001" />

        {/* Owned Assets section */}
        <section className="mt-8">
          <h2 className="text-lg font-bold text-(--color-text-primary) mb-4">
            Owned Assets
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {mockAssets.map(asset => (
              <AssetCard key={asset.id} asset={asset} compact />
            ))}
          </div>
        </section>

      </main>
    </div>
  );
}

createRoot(document.getElementById('root')).render(
  <StrictMode><ProfilePage /></StrictMode>
);
