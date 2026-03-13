/**
 * dashboard.jsx — Dashboard Page Prototype Entry
 * Owner: WH (Dev 2)
 * Route: /dashboard (dashboard.html)
 * At integration: moves to backend/src/Views/dashboard.php
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
  return (
    <div className="min-h-screen bg-(--color-bg) flex flex-col">
      <LocalNav />
      <main className="max-w-7xl mx-auto px-6 py-12 w-full flex-1 flex flex-col gap-8">
        <h1 className="text-3xl font-bold text-(--color-text-primary)">Dashboard</h1>

        {/* Stat cards — TODO WH: replace with real wallet data */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {['Portfolio Value', 'Active Listings', 'Total Sales'].map(label => (
            <Card key={label} variant="default" padding="md" className="flex flex-col gap-2">
              <p className="text-xs text-(--color-text-muted) uppercase tracking-wide">{label}</p>
              <p className="text-2xl font-bold text-(--color-text-primary)">—</p>
            </Card>
          ))}
        </div>

        <PortfolioChart />
        <ActivityFeed />
      </main>
    </div>
  );
}

createRoot(document.getElementById('root')).render(
  <StrictMode><DashboardPage /></StrictMode>
);
