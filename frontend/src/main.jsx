/**
 * main.jsx — Vapour FT Island Registry
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * HOW THIS WORKS:
 *   1. PHP views render <div id="some-island-root" data-props='{"key":"val"}'></div>
 *   2. This file calls mountIsland(id, Component) which attaches React to that div.
 *   3. Props are passed via JSON in the data-props attribute.
 *
 * FOR DEVELOPERS (Dev 1 / Dev 2):
 *   - You dont edit this file.
 *   - Build your island in src/islands/Minal/ or src/islands/WH/.
 *   - When your island is ready, tell me (CL). I will register it here.
 *
 * REGISTERING A NEW ISLAND (CL only):
 *   1. Import the component in the correct section below.
 *   2. Add a mountIsland() call with the matching DOM id.
 *   3. Ensure the PHP view has the matching <div id="..."> tag.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

// Global styles — must be imported here so Vite includes them in the build
import './index.css';

/**
 * Mounts a React island into a DOM element by id.
 * Reads initial props from data-props JSON attribute.
 * Safe to call even if the element doesn't exist on the current page.
 */
function mountIsland(id, Component) {
  const el = document.getElementById(id);
  if (!el) return; // island not present on this page — skip silently

  let props = {};
  try {
    props = JSON.parse(el.dataset.props || '{}');
  } catch (e) {
    console.error(`[mountIsland] Invalid JSON in data-props for #${id}`, e);
  }

  createRoot(el).render(
    <StrictMode>
      <Component {...props} />
    </StrictMode>
  );
}

/* ═══════════════════════════════════════════════════════════════
   CL ISLANDS
   ═══════════════════════════════════════════════════════════════ */
import ThemeToggle from './islands/CL/ThemeToggle.jsx';
mountIsland('theme-toggle-root', ThemeToggle);

// Uncomment as each CL island is completed:
// import PriceChart     from './islands/CL/PriceChart.jsx';
// import PostFeed       from './islands/CL/PostFeed.jsx';
// import CreatePost     from './islands/CL/CreatePost.jsx';
// import LikeComment    from './islands/CL/LikeComment.jsx';
// import FriendsList    from './islands/CL/FriendsList.jsx';
// import FriendRequests from './islands/CL/FriendRequests.jsx';
// import SearchUsers    from './islands/CL/SearchUsers.jsx';
// mountIsland('price-chart-root',      PriceChart);
// mountIsland('post-feed-root',        PostFeed);
// mountIsland('create-post-root',      CreatePost);
// mountIsland('like-comment-root',     LikeComment);
// mountIsland('friends-list-root',     FriendsList);
// mountIsland('friend-requests-root',  FriendRequests);
// mountIsland('search-users-root',     SearchUsers);

/* ═══════════════════════════════════════════════════════════════
   DEV 1 ISLANDS — Login · Register · Blog
   Register here once island is reviewed and approved by CL.
   ═══════════════════════════════════════════════════════════════ */
// import LoginForm    from './islands/Minal/LoginForm.jsx';
// import RegisterForm from './islands/Minal/RegisterForm.jsx';
// import BlogFeed     from './islands/Minal/BlogFeed.jsx';
// mountIsland('login-form-root',    LoginForm);
// mountIsland('register-form-root', RegisterForm);
// mountIsland('blog-feed-root',     BlogFeed);

/* ═══════════════════════════════════════════════════════════════
   DEV 2 ISLANDS — Dashboard · Profile · Listings
   Register here once island is reviewed and approved by CL.
   ═══════════════════════════════════════════════════════════════ */
// import ListingsGrid   from './islands/WH/ListingsGrid.jsx';
// import ProfileCard    from './islands/WH/ProfileCard.jsx';
// import PortfolioChart from './islands/WH/PortfolioChart.jsx';
// import ActivityFeed   from './islands/WH/ActivityFeed.jsx';
// mountIsland('listings-grid-root',   ListingsGrid);
// mountIsland('profile-card-root',    ProfileCard);
// mountIsland('portfolio-chart-root', PortfolioChart);
// mountIsland('activity-feed-root',   ActivityFeed);