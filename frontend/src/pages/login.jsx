/**
 * login.jsx — Login Page Prototype Entry
 * Owner: Minal (Dev 1)
 * Route: /login (login.html)
 * At integration: moves to backend/src/Views/login.php
 */

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '../index.css';

import LocalNav  from '../shared/molecules/LocalNav.jsx';
import LoginForm from '../islands/Minal/LoginForm.jsx';

const saved = localStorage.getItem('vft-theme');
document.documentElement.setAttribute('data-theme',
  ['dark','light','colorblind'].includes(saved) ? saved : 'dark'
);

function LoginPage() {
  return (
    <div className="min-h-screen bg-(--color-bg) flex-col">
      <LocalNav />
      <main className="flex-1 flex items-center justify-center px-6 py-16">
        <LoginForm />
      </main>
    </div>
  );
}

createRoot(document.getElementById('root')).render(
  <StrictMode><LoginPage /></StrictMode>
);
