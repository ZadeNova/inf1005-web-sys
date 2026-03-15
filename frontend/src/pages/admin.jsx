/**
 * admin.jsx — Admin Page Prototype Entry
 * Owner: CL (Lead)
 * Route: /admin (admin.html)
 * At integration: moves to backend/src/Views/admin.php
 * Protected by: AdminMiddleware (redirect to / if not admin)
 *
 * AVAILABLE ISLANDS:
 *   <CreateNewsPost />        ← mounts as <div id="create-news-post-root">
 *   <AdminListingsManager />  ← mounts as <div id="admin-listings-manager-root">
 */

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '../index.css';

import LocalNav              from '../shared/molecules/LocalNav.jsx';
import CreateNewsPost        from '../islands/CL/CreateNewsPost.jsx';
import AdminListingsManager  from '../islands/CL/AdminListingsManager.jsx';

const saved = localStorage.getItem('vft-theme');
document.documentElement.setAttribute('data-theme',
  ['dark','light','colorblind'].includes(saved) ? saved : 'dark'
);

function AdminPage() {
  return (
    <div className="min-h-screen bg-(--color-bg)">
      <LocalNav />
      <main id="main-content" tabIndex="-1" className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <h1 className="text-2xl font-bold text-(--color-text-primary) mb-8">
          Admin Panel
        </h1>

        {/* Blog / News section */}
        <section aria-labelledby="news-heading" className="mb-12">
          <h2 id="news-heading"
              className="text-lg font-semibold text-(--color-text-primary) mb-4">
            Publish Market News
          </h2>
          <CreateNewsPost />
        </section>

        {/* Listings intervention section */}
        <section aria-labelledby="listings-heading">
          <h2 id="listings-heading"
              className="text-lg font-semibold text-(--color-text-primary) mb-4">
            Manage Listings
          </h2>
          <AdminListingsManager />
        </section>
      </main>
    </div>
  );
}

createRoot(document.getElementById('root')).render(
  <StrictMode><AdminPage /></StrictMode>
);