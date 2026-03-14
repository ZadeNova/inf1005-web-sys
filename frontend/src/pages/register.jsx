/**
 * register.jsx — Register Page Prototype Entry
 * Owner: Minal (Dev 1)
 * Route: /register (register.html)
 * At integration: moves to backend/src/Views/register.php
 * 
 * AVAILABLE ISLANDS (yours to mount):
 *   <RegisterForm /> ← mounts as  <div id="register-form-root">  in register.php
 *
 * AVAILABLE ATOMS (import from shared):
 *   Card, Button, Badge, Skeleton  ← from '../shared/atoms/...'
 *
 *     the register page will likely need:
 *   - A centred card layout (the form is already inside RegisterForm)
 *   - Maybe a brand logo / title above the form
 *   - A link to /login for returning users
 *   - Keep it simple and clean — this is an auth page, not a landing page
 *   - Can mirror the same layout as login.jsx for visual consistency
 */

import { StrictMode }  from 'react';
import { createRoot }  from 'react-dom/client';
import '../index.css';

import LocalNav      from '../shared/molecules/LocalNav.jsx';
import RegisterForm  from '../islands/Minal/RegisterForm.jsx';

const saved = localStorage.getItem('vft-theme');
document.documentElement.setAttribute('data-theme',
  ['dark','light','colorblind'].includes(saved) ? saved : 'dark'
);

function RegisterPage() {
  // TODO Minal: build your Register page UI here.
  // Mount <RegisterForm /> somewhere inside your layout.
  // This is your creative space — design the full page around the island.
}

createRoot(document.getElementById('root')).render(
  <StrictMode><RegisterPage /></StrictMode>
);
