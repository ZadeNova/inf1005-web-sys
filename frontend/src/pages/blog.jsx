/**
 * blog.jsx — Blog Page Prototype Entry
 * Owner: Minal (Dev 1)
 * Route: /blog (blog.html)
 * At integration: moves to backend/src/Views/blog.php
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
    <div className="min-h-screen bg-(--color-bg) flex flex-col">
      <LocalNav />
      <main className="max-w-7xl mx-auto px-6 py-12 w-full flex-1">
        <h1 className="text-3xl font-bold text-(--color-text-primary) mb-8">News & Updates</h1>
        <BlogFeed />
      </main>
    </div>
  );
}

createRoot(document.getElementById('root')).render(
  <StrictMode><BlogPage /></StrictMode>
);
