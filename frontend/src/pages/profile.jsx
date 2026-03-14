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

const saved = localStorage.getItem('vft-theme');
document.documentElement.setAttribute('data-theme',
  ['dark','light','colorblind'].includes(saved) ? saved : 'dark'
);

function ProfilePage() {
  // build UI here
}

createRoot(document.getElementById('root')).render(
  <StrictMode><ProfilePage /></StrictMode>
);
