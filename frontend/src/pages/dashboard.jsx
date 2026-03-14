/**
 * dashboard.jsx — Dashboard Page Prototype Entry
 * Owner: WH (Dev 2)
 * Route: /dashboard (dashboard.html)
 * At integration: moves to backend/src/Views/dashboard.php
 * 
 *   AVAILABLE ISLANDS (yours to mount):
 *   <PortfolioChart /> ← mounts as  <div id="portfolio-chart-root">
 *   <ActivityFeed />   ← mounts as  <div id="activity-feed-root">
 *
 * AVAILABLE ATOMS (import from shared):
 *   Card, Button, Badge, Skeleton  ← from '../shared/atoms/...'
 *
 *     the dashboard will likely need:
 *   - A page heading (e.g. "My Dashboard")
 *   - A row of stat summary cards (Portfolio Value, Active Listings, Total Sales)
 *     Use mock values for now — these will come from the API later
 *   - PortfolioChart island below the stat cards
 *   - ActivityFeed island below the chart
 */

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '../index.css';

import LocalNav      from '../shared/molecules/LocalNav.jsx';
import Card          from '../shared/atoms/Card.jsx';
import PortfolioChart from '../islands/WH/PortfolioChart.jsx';
import ActivityFeed  from '../islands/WH/ActivityFeed.jsx';

const saved = localStorage.getItem('vft-theme');
document.documentElement.setAttribute('data-theme',
  ['dark','light','colorblind'].includes(saved) ? saved : 'dark'
);

function DashboardPage() {
  // TODO WH: build your Dashboard page UI here.
  // Mount <PortfolioChart /> and <ActivityFeed /> somewhere inside your layout.
  // This is your creative space — design the full page around the islands.
}

createRoot(document.getElementById('root')).render(
  <StrictMode><DashboardPage /></StrictMode>
);
