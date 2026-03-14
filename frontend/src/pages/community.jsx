/**
 * community.jsx — Community Page Prototype Entry
 * Owner: CL (Lead)
 * Route: /community (community.html)
 * At integration: moves to backend/src/Views/community.php
 * 
 *   AVAILABLE ISLANDS (yours to mount):
 *   <PostFeed />       ← mounts as  <div id="post-feed-root">
 *   <CreatePost />     ← mounts as  <div id="create-post-root">
 *   <FriendsList />    ← mounts as  <div id="friends-list-root">
 *   <FriendRequests /> ← mounts as  <div id="friend-requests-root">
 *   <SearchUsers />    ← mounts as  <div id="search-users-root">
 *
 * AVAILABLE ATOMS (import from shared):
 *   Card, Button, Badge, Skeleton  ← from '../shared/atoms/...'
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
// build UI here
}

createRoot(document.getElementById('root')).render(
  <StrictMode><CommunityPage /></StrictMode>
);
