/**
 * useApi.js — Vapour FT Shared Hook
 * LEAD ONLY — shared hook, do not modify without Frontend Lead approval.
 *
 * Provides a standardised fetch wrapper with:
 *   - loading / error / data states
 *   - CSRF token injection from meta tag
 *   - JSON parsing
 *   - AbortController cleanup on unmount
 *
 * Usage (GET):
 *   const { data, loading, error } = useApi('/api/v1/assets');
 *
 * Usage (manual trigger, POST):
 *   const { data, loading, error, execute } = useApi('/api/v1/offers', {
 *     method: 'POST',
 *     auto: false,
 *   });
 *   // then: execute({ assetId: 'asset-001', amount: 100 });
 */

import { useState, useEffect, useCallback, useRef } from 'react';

/** Reads the CSRF token Slim injects into the <meta name="csrf-token"> tag */
function getCsrfToken() {
  return document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') ?? '';
}

/**
 * @param {string} url               - e.g. '/api/v1/assets'
 * @param {object} options
 * @param {'GET'|'POST'|'PUT'|'DELETE'|'PATCH'} options.method - default 'GET'
 * @param {boolean} options.auto     - auto-fetch on mount (default true for GET, false otherwise)
 * @param {object} options.initialData - data to return before first fetch
 */
export function useApi(url, { method = 'GET', auto = method === 'GET', initialData = null } = {}) {
  const [state, setState] = useState({
    data:    initialData,
    loading: auto,
    error:   null,
  });

  const abortRef = useRef(null);

  const execute = useCallback(async (body = null) => {
    // Cancel any in-flight request
    if (abortRef.current) abortRef.current.abort();
    abortRef.current = new AbortController();

    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const response = await fetch(url, {
        method,
        signal: abortRef.current.signal,
        headers: {
          'Content-Type':  'application/json',
          'Accept':        'application/json',
          'X-CSRF-Token':  getCsrfToken(),
        },
        ...(body ? { body: JSON.stringify(body) } : {}),
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({ message: response.statusText }));
        throw new Error(err.message ?? `HTTP ${response.status}`);
      }

      const data = await response.json();
      setState({ data, loading: false, error: null });
      return data;
    } catch (err) {
      if (err.name === 'AbortError') return; // unmounted — swallow silently
      setState(prev => ({ ...prev, loading: false, error: err.message ?? 'Something went wrong' }));
      throw err;
    }
  }, [url, method]);

  useEffect(() => {
    if (auto) execute();
    return () => { if (abortRef.current) abortRef.current.abort(); };
  }, [auto, execute]);

  return { ...state, execute, refetch: execute };
}

/**
 * Convenience: POST wrapper
 * const { execute: createOffer, loading } = usePost('/api/v1/offers');
 */
export function usePost(url) {
  return useApi(url, { method: 'POST', auto: false });
}

/**
 * Convenience: DELETE wrapper
 */
export function useDelete(url) {
  return useApi(url, { method: 'DELETE', auto: false });
}
