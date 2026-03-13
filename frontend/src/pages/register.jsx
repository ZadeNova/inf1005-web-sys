/**
 * register.jsx — Register Page Prototype Entry
 * Owner: Minal (Dev 1)
 * Route: /register (register.html)
 * At integration: moves to backend/src/Views/register.php
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
  return (
    <div className="min-h-screen bg-(--color-bg) flex-col">
      <LocalNav />
      <main className="flex-1 flex items-center justify-center px-6 py-16">
        <RegisterForm />
      </main>
    </div>
  );
}

createRoot(document.getElementById('root')).render(
  <StrictMode><RegisterPage /></StrictMode>
);
