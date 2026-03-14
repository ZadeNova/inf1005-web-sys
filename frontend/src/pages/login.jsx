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
  // build UI here
}

createRoot(document.getElementById('root')).render(
  <StrictMode><LoginPage /></StrictMode>
);
