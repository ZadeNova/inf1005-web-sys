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
  // TODO Minal: build your Market News page UI here.
  // Mount <BlogFeed /> somewhere inside your layout.
  // This is your creative space — design the full page around the island.
}

createRoot(document.getElementById('root')).render(
  <StrictMode><BlogPage /></StrictMode>
);
