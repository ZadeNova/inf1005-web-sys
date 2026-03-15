/**
 * login.jsx — Login Page Prototype Entry
 * Owner: Minal (Dev 1)
 * Route: /login (login.html)
 * At integration: moves to backend/src/Views/login.php
 * AVAILABLE ISLANDS (yours to mount):
 *   <LoginForm /> ← mounts as  <div id="login-form-root">  in login.php
 *
 * AVAILABLE ATOMS (import from shared):
 *   Card, Button, Badge, Skeleton  ← from '../shared/atoms/...'
 *
 *     the login page will likely need:
 *   - A centred card layout (the form is already inside LoginForm)
 *   - Maybe a brand logo / title above the form
 *   - A link to /register for new users
 *   - Keep it simple and clean — this is an auth page, not a landing page
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
    <div className="min-h-screen bg-(--color-bg) flex flex-col">

      <LocalNav />

      <main
        id="main-content"
        tabIndex="-1"
        className="flex flex-1 items-center justify-center px-4 py-12"
      >
        <div className="w-full max-w-md flex flex-col items-center gap-8">

          {/* Brand header */}
          <div className="text-center">
            <h1 className="text-3xl font-bold text-(--color-text-primary) tracking-tight">
              Vapour<span className="text-(--color-accent)">FT</span>
            </h1>
            <p className="text-sm text-(--color-text-secondary) mt-1">
              Sign in to your account
            </p>
          </div>

          {/* LoginForm island — the form logic lives inside here */}
          <LoginForm />

          {/* Link to register */}
          <p className="text-sm text-(--color-text-muted)">
            Don't have an account?{' '}
            <a
              href="/register"
              className="text-(--color-accent) hover:text-(--color-accent-hover) font-medium"
            >
              Create one
            </a>
          </p>

        </div>
      </main>
    </div>
  );
}

createRoot(document.getElementById('root')).render(
  <StrictMode><LoginPage /></StrictMode>
);
