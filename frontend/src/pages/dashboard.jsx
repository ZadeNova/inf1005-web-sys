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

import { StrictMode, useState, useMemo, useEffect, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import '../index.css';

import LocalNav        from '../shared/molecules/LocalNav.jsx';
import Card            from '../shared/atoms/Card.jsx';
import Badge           from '../shared/atoms/Badge.jsx';
import Button          from '../shared/atoms/Button.jsx';
import { RarityBadge } from '../shared/atoms/Badge.jsx';
import PortfolioChart  from '../islands/WH/PortfolioChart.jsx';
import { mockAssets }  from '../shared/mockAssets.js';

import {
  Chart,
  ArcElement,
  DoughnutController,
  Tooltip,
  Legend,
} from 'chart.js';

Chart.register(ArcElement, DoughnutController, Tooltip, Legend);

const saved = localStorage.getItem('vft-theme');
document.documentElement.setAttribute('data-theme',
  ['dark','light','colorblind'].includes(saved) ? saved : 'dark'
);

const mockDashboard = {
  user:      { username: '0xVault', isVerified: true },
  wallet:    { balance: 2847.00, currency: 'VPR' },
  portfolio: { value: '$2,847', change: '+12.4% this month' },
  listings: [
    { id: 'lst-001', asset: mockAssets[0], listedAt: '2025-03-01' },
    { id: 'lst-002', asset: mockAssets[2], listedAt: '2025-03-08' },
    { id: 'lst-003', asset: mockAssets[4], listedAt: '2025-03-11' },
  ],
  stats: { activeListings: 3, totalSales: 142, itemsOwned: 37 },
};

const MOCK_ACTIVITIES = [
  { id: 'act-001', type: 'buy',            label: 'Bought',         colour: 'success', assetName: 'Dark Sorcerer Supreme', amount: 249.99,  counterparty: 'ShadowHawk',  date: 'Mar 13' },
  { id: 'act-002', type: 'sell',           label: 'Sold',           colour: 'danger',  assetName: 'Neon Wraith',           amount: 2.50,    counterparty: 'NeonTrader',  date: 'Mar 12' },
  { id: 'act-003', type: 'offer_received', label: 'Offer Received', colour: 'warning', assetName: 'Ancient Phoenix',       amount: 1100.00, counterparty: 'CelestialX',  date: 'Mar 12' },
  { id: 'act-004', type: 'listing',        label: 'Listed',         colour: 'success',   assetName: 'Void Architect #003',   amount: 89.50,   counterparty: null,          date: 'Mar 11' },
  { id: 'act-005', type: 'offer_rejected', label: 'Rejected',       colour: 'danger',  assetName: 'Forest Guardian',       amount: 10.00,   counterparty: 'VaultKeeper', date: 'Mar 10' },
];

const ACTIVITY_TYPE_MAP = {
  'All':            null,
  'Bought':         'buy',
  'Sold':           'sell',
  'Offer Received': 'offer_received',
  'Listed':         'listing',
  'Rejected':       'offer_rejected',
};

const ACTIVITY_FILTER_OPTIONS = Object.keys(ACTIVITY_TYPE_MAP);

const RARITY_COLORS = {
  'COMMON':      '#94a3b8',
  'UNCOMMON':    '#4ade80',
  'RARE':        '#60a5fa',
  'ULTRA_RARE':  '#c084fc',
  'SECRET_RARE': '#f59e0b',
};

function cssVar(name) {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}

function RarityDonutChart() {
  const canvasRef = useRef(null);
  const chartRef  = useRef(null);

  const rarityCounts = useMemo(() => {
    const counts = {};
    mockAssets.forEach(a => {
      counts[a.rarity] = (counts[a.rarity] ?? 0) + 1;
    });
    return counts;
  }, []);

  useEffect(() => {
    if (!canvasRef.current) return;
    if (chartRef.current) { chartRef.current.destroy(); chartRef.current = null; }

    const labels = Object.keys(rarityCounts);
    const values = Object.values(rarityCounts);
    const colors = labels.map(r => RARITY_COLORS[r] ?? '#94a3b8');
    const textMuted = cssVar('--color-text-muted');
    const surface2  = cssVar('--color-surface-2');
    const border    = cssVar('--color-border');

    chartRef.current = new Chart(canvasRef.current, {
      type: 'doughnut',
      data: {
        labels,
        datasets: [{
          data:            values,
          backgroundColor: colors,
          borderColor:     border,
          borderWidth:     2,
          hoverOffset:     6,
        }],
      },
      options: {
        responsive:          true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'right',
            labels: {
              color:     textMuted,
              font:      { size: 11 },
              boxWidth:  12,
              padding:   10,
            },
          },
          tooltip: {
            backgroundColor: surface2,
            borderColor:     border,
            borderWidth:     1,
            titleColor:      cssVar('--color-text-primary'),
            bodyColor:       textMuted,
            callbacks: {
              label: ctx => ` ${ctx.label}: ${ctx.parsed} asset${ctx.parsed > 1 ? 's' : ''}`,
            },
          },
        },
      },
    });

    return () => { if (chartRef.current) chartRef.current.destroy(); };
  }, [rarityCounts]);

  return (
    <Card variant="default" padding="md" className="flex flex-col gap-3">
      <h3 className="text-sm font-bold text-(--color-text-primary)">Portfolio by Rarity</h3>
      <div style={{ height: 200 }}>
        <canvas ref={canvasRef} aria-label="Portfolio breakdown by rarity" role="img" />
      </div>
    </Card>
  );
}

const EyeIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4" aria-hidden="true">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
    <circle cx="12" cy="12" r="3"/>
  </svg>
);

const EyeOffIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4" aria-hidden="true">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
    <line x1="1" y1="1" x2="23" y2="23"/>
  </svg>
);

const WalletIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4" aria-hidden="true" style={{ color: '#92400e' }}>
    <rect x="2" y="5" width="20" height="14" rx="2"/>
    <path d="M16 12h2"/>
    <path d="M2 10h20"/>
  </svg>
);

function DashboardPage() {
  const { user, wallet, portfolio, listings, stats } = mockDashboard;

  const [showBalance, setShowBalance]       = useState(true);
  const [cancelledIds, setCancelledIds]     = useState([]);
  const [addedIds, setAddedIds]             = useState([]);
  const [activityFilter, setActivityFilter] = useState('All');
  const [showAddListing, setShowAddListing] = useState(false);
  const [listSearch, setListSearch]         = useState('');

  const maskedBalance = '$' + wallet.balance.toLocaleString().replace(/[0-9]/g, 'x');

  const activeListings = listings.filter(l =>
    !cancelledIds.includes(l.id) || addedIds.includes(l.id)
  );

  const searchResults = useMemo(() =>
    listings.filter(l =>
      cancelledIds.includes(l.id) &&
      !addedIds.includes(l.id) &&
      (listSearch === '' || l.asset.name.toLowerCase().includes(listSearch.toLowerCase()))
    ), [listSearch, cancelledIds, addedIds]
  );

  const filteredActivities = useMemo(() => {
    const typeKey = ACTIVITY_TYPE_MAP[activityFilter];
    if (!typeKey) return MOCK_ACTIVITIES;
    return MOCK_ACTIVITIES.filter(a => a.type === typeKey);
  }, [activityFilter]);

  function handleCancel(id) {
    setCancelledIds(prev => [...prev, id]);
    setAddedIds(prev => prev.filter(i => i !== id));
  }

  function handleAddListing(listing) {
    setAddedIds(prev => [...prev, listing.id]);
    setCancelledIds(prev => prev.filter(i => i !== listing.id));
    setListSearch('');
    setShowAddListing(false);
  }

  function handleCloseSearch() {
    setShowAddListing(false);
    setListSearch('');
  }

  return (
    <div className="min-h-screen bg-(--color-bg)">
      <LocalNav />
      <main className="max-w-6xl mx-auto px-4 py-8 flex flex-col gap-8">

        <div>
          <h1 className="text-2xl font-bold text-(--color-text-primary)">My Dashboard</h1>
          <p className="text-sm text-(--color-text-muted) mt-1 flex items-center gap-2">
            Welcome back,
            <span className="text-(--color-text-primary) font-semibold">{user.username}</span>
            {user.isVerified && <Badge label="Verified" colour="accent" size="sm" />}
          </p>
        </div>

        <section className="flex flex-col gap-4">
          <h2 className="text-base font-bold text-(--color-text-primary)">My Portfolio</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Card variant="default" padding="md" className="flex flex-col gap-2">
              <p className="text-[10px] text-(--color-text-muted) uppercase tracking-wide">Portfolio Value</p>
              <p className="text-2xl font-bold text-(--color-text-primary)">{portfolio.value}</p>
              <p className="text-xs text-(--color-success)">{portfolio.change}</p>
            </Card>
            <Card variant="default" padding="md" className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <WalletIcon />
                <p className="text-[10px] text-(--color-text-muted) uppercase tracking-wide">Wallet Balance</p>
                <button
                  type="button"
                  onClick={() => setShowBalance(v => !v)}
                  aria-label={showBalance ? 'Hide balance' : 'Show balance'}
                  className="ml-auto text-(--color-text-muted) hover:text-(--color-accent) transition-colors"
                >
                  {showBalance ? <EyeIcon /> : <EyeOffIcon />}
                </button>
              </div>
              <p className="text-2xl font-bold text-(--color-accent)">
                {showBalance ? `$${wallet.balance.toLocaleString()}` : maskedBalance}
                <span className="text-xs font-normal text-(--color-text-muted) ml-1">{wallet.currency}</span>
              </p>
            </Card>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2">
              <PortfolioChart />
            </div>
            <div>
              <RarityDonutChart />
            </div>
          </div>
        </section>

        <section className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-(--color-text-primary)">My Listings</h2>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3 text-sm">
                <span>
                  <span className="font-bold text-(--color-text-primary)">{activeListings.length}</span>
                  <span className="text-(--color-text-muted) ml-1">active</span>
                </span>
                <span>
                  <span className="font-bold text-(--color-text-primary)">{stats.totalSales}</span>
                  <span className="text-(--color-text-muted) ml-1">total sales</span>
                </span>
                <span>
                  <span className="font-bold text-(--color-text-primary)">{stats.itemsOwned}</span>
                  <span className="text-(--color-text-muted) ml-1">owned</span>
                </span>
              </div>
              <button
                type="button"
                onClick={() => setShowAddListing(v => !v)}
                aria-label="Add listing"
                className="w-7 h-7 rounded-full bg-(--color-accent) text-white flex items-center justify-center hover:bg-(--color-accent-hover) transition-colors text-lg leading-none"
              >
                +
              </button>
            </div>
          </div>

          {showAddListing && (
            <div className="relative">
              <div className="relative flex items-center">
                <input
                  type="search"
                  value={listSearch}
                  onChange={e => setListSearch(e.target.value)}
                  placeholder="Search your cancelled listings to re-add..."
                  className="bg-(--color-surface-2) border border-(--color-border)
                             text-(--color-text-primary) text-sm rounded-full
                             px-4 py-2 w-full pr-10"
                  aria-label="Search listings to re-add"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={handleCloseSearch}
                  aria-label="Close search"
                  className="absolute right-3 text-(--color-text-muted) hover:text-(--color-accent) transition-colors text-base leading-none"
                >
                  ✕
                </button>
              </div>

              {searchResults.length > 0 && (
                <ul
                  className="absolute top-full left-0 right-0 z-50 mt-1
                             bg-(--color-surface) border border-(--color-border)
                             rounded-md shadow-lg overflow-y-auto"
                  style={{ maxHeight: '13rem' }}
                >
                  {searchResults.map(listing => (
                    <li key={listing.id}>
                      <button
                        type="button"
                        onClick={() => handleAddListing(listing)}
                        className="w-full flex items-center gap-3 px-4 py-2 text-left
                                   hover:bg-(--color-surface-2) transition-colors"
                      >
                        <div className="w-8 h-8 rounded bg-(--color-surface-2) border border-(--color-border) flex items-center justify-center shrink-0">
                          <span className="text-[10px] text-(--color-text-muted)">IMG</span>
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-(--color-text-primary)">{listing.asset.name}</p>
                          <p className="text-xs text-(--color-text-muted)">{listing.asset.rarity} · ${listing.asset.price.toLocaleString()}</p>
                        </div>
                      </button>
                    </li>
                  ))}
                </ul>
              )}

              {searchResults.length === 0 && (
                <p className="text-xs text-(--color-text-muted) mt-2 px-2">
                  {cancelledIds.length === 0 ? 'No cancelled listings to re-add.' : 'No results found.'}
                </p>
              )}
            </div>
          )}

          {activeListings.length === 0 ? (
            <button
              type="button"
              onClick={() => setShowAddListing(true)}
              className="w-full border-2 border-dashed border-(--color-border)
                         rounded-lg py-10 flex flex-col items-center gap-2
                         hover:border-(--color-accent) transition-colors group"
            >
              <span className="w-10 h-10 rounded-full bg-(--color-surface-2) group-hover:bg-(--color-accent)
                               flex items-center justify-center text-xl text-(--color-text-muted)
                               group-hover:text-white transition-colors">
                +
              </span>
              <p className="text-sm text-(--color-text-muted) group-hover:text-(--color-accent) transition-colors">
                No active listings — click here to add one!
              </p>
            </button>
          ) : (
            <div className="flex flex-col gap-3">
              {activeListings.map(listing => (
                <Card key={listing.id} variant="default" padding="md" className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-md bg-(--color-surface-2) border border-(--color-border) shrink-0 flex items-center justify-center">
                    <span className="text-xs text-(--color-text-muted)">IMG</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-(--color-text-primary) truncate">
                      {listing.asset.name}
                    </p>
                    <div className="flex gap-1 mt-1">
                      <RarityBadge tier={listing.asset.rarity} size="sm" />
                    </div>
                    <p className="text-xs text-(--color-text-muted) mt-1">
                      Listed {new Date(listing.listedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-2 shrink-0">
                    <p className="text-sm font-bold text-(--color-text-primary)">
                      ${listing.asset.price.toLocaleString()}
                    </p>
                    <Button variant="danger" size="sm" onClick={() => handleCancel(listing.id)} className="rounded-full">
                      Cancel
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </section>

        <section className="flex flex-col gap-4">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <h2 className="text-base font-bold text-(--color-text-primary)">Recent Activity</h2>
            <select
              value={activityFilter}
              onChange={e => setActivityFilter(e.target.value)}
              className="bg-(--color-surface-2) border border-(--color-border)
                         text-(--color-text-primary) text-sm rounded-md px-3 py-1.5"
              aria-label="Filter activity"
            >
              {ACTIVITY_FILTER_OPTIONS.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>

          <Card variant="default" padding="md" className="flex flex-col">
            {filteredActivities.length === 0 ? (
              <p className="text-sm text-(--color-text-muted) text-center py-6">No activity found.</p>
            ) : (
              filteredActivities.map((activity, idx) => (
                <div
                  key={activity.id}
                  className={`flex items-center gap-3 py-3 ${idx < filteredActivities.length - 1 ? 'border-b border-(--color-border)' : ''}`}
                >
                  <span
                    className="text-xs font-bold px-2 py-1 rounded-full shrink-0 text-center"
                    style={{
                      backgroundColor: `var(--color-${activity.colour}-subtle)`,
                      color: `var(--color-${activity.colour})`,
                      border: `1px solid var(--color-${activity.colour})`,
                      minWidth: '90px',
                    }}
                  >
                    {activity.label}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-(--color-text-primary) truncate">
                      {activity.assetName}
                    </p>
                    {activity.counterparty && (
                      <p className="text-[10px] text-(--color-text-muted)">with {activity.counterparty}</p>
                    )}
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-xs font-bold text-(--color-text-primary)">${activity.amount.toLocaleString()}</p>
                    <p className="text-[10px] text-(--color-text-muted)">{activity.date}</p>
                  </div>
                </div>
              ))
            )}
          </Card>
        </section>

      </main>
    </div>
  );
}

createRoot(document.getElementById('root')).render(
  <StrictMode><DashboardPage /></StrictMode>
);
