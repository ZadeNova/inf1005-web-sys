/**
 * useTheme.js — Vapour FT Shared Hook
 * LEAD ONLY — shared hook, do not modify without Frontend Lead approval.
 *
 * Reads and sets the data-theme attribute on <html>.
 * Persists preference to localStorage.
 * Respects prefers-color-scheme on first visit.
 *
 * Usage:
 *   const { theme, setTheme } = useTheme();
 *   // theme: 'dark' | 'light' | 'colorblind'
 */

import { useState, useEffect, useCallback } from 'react';

const THEMES   = ['light', 'colorblind'];
const STORAGE_KEY = 'vft-theme';

function getInitialTheme() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (THEMES.includes(stored)) return stored;
  } catch (_) { /* storage blocked */ }

  // Respect OS preference on first visit
  return 'light';
}

function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  try { localStorage.setItem(STORAGE_KEY, theme); } catch (_) { /* blocked */ }
}

export function useTheme() {
  const [theme, setThemeState] = useState(() => {
    // SSR guard
    if (typeof window === 'undefined') return 'light';
    return getInitialTheme();
  });

  // Apply on mount + whenever theme changes
  useEffect(() => { applyTheme(theme); }, [theme]);

  const setTheme = useCallback((next) => {
    if (!THEMES.includes(next)) {
      console.warn(`[useTheme] Invalid theme "${next}". Must be one of: ${THEMES.join(', ')}`);
      return;
    }
    setThemeState(next);
  }, []);

  const cycleTheme = useCallback(() => {
    setThemeState(prev => {
      const idx = THEMES.indexOf(prev);
      return THEMES[(idx + 1) % THEMES.length];
    });
  }, []);

  return { theme, setTheme, cycleTheme, themes: THEMES };
}
