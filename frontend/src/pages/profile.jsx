/**
 * profile.jsx — Profile Page Prototype Entry
 * Owner: WH (Dev 2)
 * Route: /profile (profile.html)
 * At integration: moves to backend/src/Views/profile.php
 */

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '../index.css';

import LocalNav   from '../shared/molecules/LocalNav.jsx';
import ProfileCard from '../islands/WH/ProfileCard.jsx';

const saved = localStorage.getItem('vft-theme');
document.documentElement.setAttribute('data-theme',
  ['dark','light','colorblind'].includes(saved) ? saved : 'dark'
);

function ProfilePage() {
  return (
    <div className="min-h-screen bg-(--color-bg)x flex-col">
      <LocalNav />
      <main className="max-w-7xl mx-auto px-6 py-12 w-full flex-1">
        <div className="max-w-sm">
          <ProfileCard userId="user-001" />
        </div>
        {/* TODO WH: add owned assets grid below ProfileCard */}
      </main>
    </div>
  );
}

createRoot(document.getElementById('root')).render(
  <StrictMode><ProfilePage /></StrictMode>
);
