/**
 * blog.jsx — Blog Page Prototype Entry
 * Owner: Minal (Dev 1)
 * Route: /blog (blog.html)
 * At integration: moves to backend/src/Views/blog.php
 * 
 * AVAILABLE ISLANDS (yours to mount):
 *   <BlogFeed />   ← mounts as  <div id="blog-feed-root">  in blog.php
 *
 * AVAILABLE ATOMS (import from shared):
 *   Card, Button, Badge, Skeleton  ← from '../../shared/atoms/...'
 *
 */

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '../index.css';

import LocalNav from '../shared/molecules/LocalNav.jsx';
import BlogFeed from '../islands/Minal/BlogFeed.jsx';

const saved = localStorage.getItem('vft-theme');
document.documentElement.setAttribute('data-theme',
  ['dark','light','colorblind'].includes(saved) ? saved : 'dark'
);

function BlogPage() {
  return (
    <div className="min-h-screen bg-(--color-bg)">

      {/* Top navigation bar */}
      <LocalNav />

      {/* Main page content */}
      <main id="main-content" tabIndex="-1" className="max-w-7xl mx-auto px-4 sm:px-6 py-8">

        <h1 className="text-3xl font-bold text-(--color-text-primary) mb-2">
          Market News
        </h1>
        <p className="text-sm text-(--color-text-secondary) mb-8">
          Collection drops, trading guides, and marketplace updates.
        </p>

        {/* BlogFeed island — the card grid lives inside here */}
        <BlogFeed />

      </main>
    </div>
  );
}

createRoot(document.getElementById('root')).render(
  <StrictMode><BlogPage /></StrictMode>
);
