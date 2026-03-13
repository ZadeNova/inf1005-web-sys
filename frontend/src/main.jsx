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
 *   - Build your island in src/islands/dev1/ or src/islands/dev2/.
 *   - Test locally using the TestBed (see src/TestBed.jsx).
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
   LEAD ISLANDS
   ═══════════════════════════════════════════════════════════════ */
import ThemeToggle from './islands/lead/ThemeToggle.jsx';
mountIsland('theme-toggle-root', ThemeToggle);

// Uncomment as each Lead island is completed:
// import PriceChart     from './islands/lead/PriceChart.jsx';
// import PostFeed       from './islands/lead/PostFeed.jsx';
// import CreatePost     from './islands/lead/CreatePost.jsx';
// import LikeComment    from './islands/lead/LikeComment.jsx';
// import FriendsList    from './islands/lead/FriendsList.jsx';
// import FriendRequests from './islands/lead/FriendRequests.jsx';
// import SearchUsers    from './islands/lead/SearchUsers.jsx';
// mountIsland('price-chart-root',      PriceChart);
// mountIsland('post-feed-root',        PostFeed);
// mountIsland('create-post-root',      CreatePost);
// mountIsland('like-comment-root',     LikeComment);
// mountIsland('friends-list-root',     FriendsList);
// mountIsland('friend-requests-root',  FriendRequests);
// mountIsland('search-users-root',     SearchUsers);

/* ═══════════════════════════════════════════════════════════════
   DEV 1 ISLANDS — Login · Register · Blog
   Register here once island is reviewed and approved by Lead.
   ═══════════════════════════════════════════════════════════════ */
// import LoginForm    from './islands/dev1/LoginForm.jsx';
// import RegisterForm from './islands/dev1/RegisterForm.jsx';
// import BlogFeed     from './islands/dev1/BlogFeed.jsx';
// mountIsland('login-form-root',    LoginForm);
// mountIsland('register-form-root', RegisterForm);
// mountIsland('blog-feed-root',     BlogFeed);

/* ═══════════════════════════════════════════════════════════════
   DEV 2 ISLANDS — Dashboard · Profile · Listings
   Register here once island is reviewed and approved by Lead.
   ═══════════════════════════════════════════════════════════════ */
// import ListingsGrid   from './islands/dev2/ListingsGrid.jsx';
// import ProfileCard    from './islands/dev2/ProfileCard.jsx';
// import PortfolioChart from './islands/dev2/PortfolioChart.jsx';
// import ActivityFeed   from './islands/dev2/ActivityFeed.jsx';
// mountIsland('listings-grid-root',   ListingsGrid);
// mountIsland('profile-card-root',    ProfileCard);
// mountIsland('portfolio-chart-root', PortfolioChart);
// mountIsland('activity-feed-root',   ActivityFeed);