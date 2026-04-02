/**
 * main.jsx — Vapour FT Island Registry
 *
 * CHANGE: All islands are now wrapped in <ToastProvider> so any island
 * can call useToast() without its own context setup.
 * ToastProvider renders the toast stack into a portal-like fixed div
 * that sits above all other content (z-index: 9999 in toast.css).
 */

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';

import { ToastProvider } from './shared/context/ToastContext.jsx';

function mountIsland(id, Component) {
  const el = document.getElementById(id);
  if (!el) return;

  let props = {};
  try {
    props = JSON.parse(el.dataset.props || '{}');
  } catch (e) {
    console.error(`[mountIsland] Invalid JSON in data-props for #${id}`, e);
  }

  createRoot(el).render(
    <StrictMode>
      <ToastProvider>
        <Component {...props} />
      </ToastProvider>
    </StrictMode>
  );
}

/* ═══════════════════════════════════════════════════════════════
   CL ISLANDS
   ═══════════════════════════════════════════════════════════════ */
import ThemeToggle          from './islands/CL/ThemeToggle.jsx';
import CreateNewsPost       from './islands/CL/CreateNewsPost.jsx';
import AdminListingsManager from './islands/CL/AdminListingsManager.jsx';
import AdminBlogManager     from './islands/CL/AdminBlogManager.jsx';
import NavWallet            from './islands/CL/NavWallet.jsx';
import CreateAssetForm      from './islands/CL/CreateAssetForm.jsx';

mountIsland('theme-toggle-root',           ThemeToggle);
mountIsland('create-news-post-root',       CreateNewsPost);
mountIsland('admin-listings-manager-root', AdminListingsManager);
mountIsland('admin-blog-manager-root',     AdminBlogManager);
mountIsland('nav-wallet-root',             NavWallet);
mountIsland('create-asset-form-root',      CreateAssetForm);


/* ═══════════════════════════════════════════════════════════════
   Minal ISLANDS — Login · Register · Blog
   ═══════════════════════════════════════════════════════════════ */
import LoginForm    from './islands/Minal/LoginForm.jsx';
import RegisterForm from './islands/Minal/RegisterForm.jsx';
import BlogFeed     from './islands/Minal/BlogFeed.jsx';
mountIsland('login-form-root',    LoginForm);
mountIsland('register-form-root', RegisterForm);
mountIsland('blog-feed-root',     BlogFeed);

/* ═══════════════════════════════════════════════════════════════
   WH ISLANDS — Dashboard · Profile · Listings
   ═══════════════════════════════════════════════════════════════ */
import ListingsGrid          from './islands/WH/ListingsGrid.jsx';
import ProfileCard           from './islands/WH/ProfileCard.jsx';
import ActivityFeed          from './islands/WH/ActivityFeed.jsx';
import RarityDonutChart      from './islands/WH/RarityDonutChart.jsx';
import ActiveListingsManager from './islands/WH/ActiveListingsManager.jsx';
import ProfileCollections    from './islands/WH/ProfileCollections.jsx';
import WalletBalance         from './islands/WH/WalletBalance.jsx';
import PortfolioTable        from './islands/WH/PortfolioTable.jsx';
import TransactionHistory    from './islands/WH/TransactionHistory.jsx';
import ListingDetail         from './islands/WH/ListingDetail.jsx';
mountIsland('listing-detail-root',         ListingDetail);
mountIsland('listings-grid-root',          ListingsGrid);
mountIsland('profile-card-root',           ProfileCard);
mountIsland('portfolio-chart-root',        PortfolioChart);
mountIsland('activity-feed-root',          ActivityFeed);
mountIsland('rarity-donut-chart-root',     RarityDonutChart);
mountIsland('active-listings-manager-root',ActiveListingsManager);
mountIsland('profile-collections-root',    ProfileCollections);
mountIsland('wallet-balance-root',         WalletBalance);
mountIsland('portfolio-table-root',        PortfolioTable);
mountIsland('transaction-history-root',    TransactionHistory);