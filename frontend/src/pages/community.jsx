/**
 * community.jsx — Community Page Prototype Entry
 * Owner: CL (Lead)
 * Route: /community (community.html)
 * At integration: moves to backend/src/Views/community.php
 */

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '../index.css';

import LocalNav       from '../shared/molecules/LocalNav.jsx';
import PostFeed       from '../islands/CL/PostFeed.jsx';
import CreatePost     from '../islands/CL/CreatePost.jsx';
import FriendsList    from '../islands/CL/FriendsList.jsx';
import FriendRequests from '../islands/CL/FriendRequests.jsx';
import SearchUsers    from '../islands/CL/SearchUsers.jsx';

const saved = localStorage.getItem('vft-theme');
document.documentElement.setAttribute('data-theme',
  ['dark','light','colorblind'].includes(saved) ? saved : 'dark'
);

function CommunityPage() {
  return (
    <div className="min-h-screen bg-(--color-bg)x flex-col">
      <LocalNav />
      <main className="max-w-7xl mx-auto px-6 py-12 w-full flex-1">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Main feed — left 2/3 */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            <CreatePost />
            <PostFeed />
          </div>

          {/* Sidebar — right 1/3 */}
          <div className="flex flex-col gap-5">
            <SearchUsers />
            <FriendRequests />
            <FriendsList />
          </div>

        </div>
      </main>
    </div>
  );
}

createRoot(document.getElementById('root')).render(
  <StrictMode><CommunityPage /></StrictMode>
);
