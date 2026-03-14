/**
 * home.jsx — Home Page Prototype Entry
 * Owner: CL (Lead)
 * Route: / (index.html)
 * At integration: moves to backend/src/Views/home.php
 * 
 *   AVAILABLE ISLANDS (yours to mount):
 *   <PriceChart /> ← mounts as  <div id="price-chart-root">
 *
 * AVAILABLE MOLECULES + ATOMS (import from shared):
 *   AssetCard  ← from '../shared/molecules/AssetCard.jsx'
 *   Card, Button, Badge, Skeleton  ← from '../shared/atoms/...'
 *
 * MOCK DATA (already available):
 *   mockAssets  ← array of NFT asset objects for featured listings
 *   mockStats   ← { totalVolume, activeListings, totalUsers, floorPrice, weeklyChange }
 *
 *  the home page sections are:
 *   1. Hero — headline, subtext, CTA buttons
 *   2. Stats bar — 4 key market stats using mockStats
 *   3. PriceChart island — "Market Overview" section
 *   4. Featured listings — grid of 3 AssetCard using mockAssets.slice(0, 3)
 *
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
  // build UI here
}

createRoot(document.getElementById('root')).render(
  <StrictMode><HomePage /></StrictMode>
);
