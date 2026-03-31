/**
 * ToastContext.jsx — Vapour FT Shared Toast System
 * LEAD ONLY — shared context, do not modify without Frontend Lead approval.
 *
 * Provides a singleton toast notification system via React Context.
 * Mount <ToastProvider> once in main.jsx wrapping all islands.
 * Any island calls useToast() to fire a notification.
 *
 * Usage:
 *   const toast = useToast();
 *   toast.success('Purchase successful', 'Glacial Trace AWP is in your portfolio');
 *   toast.listing('Listing created', 'Emberline Karambit listed for $1,250.00');
 *   toast.cancel('Listing cancelled', 'Dark Star II removed from market');
 *   toast.error('Purchase failed', 'Insufficient wallet balance');
 *
 * Types: 'success' | 'listing' | 'cancel' | 'error'
 *
 * Behaviour:
 *   - Auto-dismiss after 4 000 ms (errors: 6 000 ms).
 *   - Max 4 toasts visible at once; oldest is evicted.
 *   - Stacks bottom-right, newest on top.
 *   - Slide-in from right on enter, slide-out on leave.
 *   - Respects prefers-reduced-motion (instant show/hide).
 *   - Accessible: role="status" + aria-live="polite" for success/info,
 *     role="alert" + aria-live="assertive" for errors.
 */

import {
  createContext,
  useCallback,
  useContext,
  useReducer,
  useEffect,
  useRef,
} from 'react';

/* ── Constants ────────────────────────────────────────────────────────── */
const MAX_TOASTS    = 4;
const DURATION      = { success: 4000, listing: 4000, cancel: 4000, error: 6000 };
const ANIM_DURATION = 280; // must match CSS transition duration

/* ── Config per type ──────────────────────────────────────────────────── */
const TYPE_CONFIG = {
  success: {
    accentVar:  'var(--color-success)',
    ariaRole:   'status',
    ariaLive:   'polite',
    Icon: () => (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
           stroke="var(--color-success)" strokeWidth="2.5" aria-hidden="true">
        <polyline points="20 6 9 17 4 12" />
      </svg>
    ),
  },
  listing: {
    accentVar:  'var(--color-accent)',
    ariaRole:   'status',
    ariaLive:   'polite',
    Icon: () => (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
           stroke="var(--color-accent)" strokeWidth="2.5" aria-hidden="true">
        <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
        <line x1="7" y1="7" x2="7.01" y2="7" />
      </svg>
    ),
  },
  cancel: {
    accentVar:  'var(--color-warning)',
    ariaRole:   'status',
    ariaLive:   'polite',
    Icon: () => (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
           stroke="var(--color-warning)" strokeWidth="2.5" aria-hidden="true">
        <polyline points="3 6 5 6 21 6" />
        <path d="M19 6l-1 14H6L5 6" />
        <path d="M10 11v6M14 11v6" />
        <path d="M9 6V4h6v2" />
      </svg>
    ),
  },
  error: {
    accentVar:  'var(--color-danger)',
    ariaRole:   'alert',
    ariaLive:   'assertive',
    Icon: () => (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
           stroke="var(--color-danger)" strokeWidth="2.5" aria-hidden="true">
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="8" x2="12" y2="12" />
        <line x1="12" y1="16" x2="12.01" y2="16" />
      </svg>
    ),
  },
};

/* ── Reducer ──────────────────────────────────────────────────────────── */
function reducer(state, action) {
  switch (action.type) {
    case 'ADD': {
      const next = [...state, action.toast];
      return next.length > MAX_TOASTS ? next.slice(next.length - MAX_TOASTS) : next;
    }
    case 'START_EXIT':
      return state.map(t => t.id === action.id ? { ...t, exiting: true } : t);
    case 'REMOVE':
      return state.filter(t => t.id !== action.id);
    default:
      return state;
  }
}

/* ── Context ──────────────────────────────────────────────────────────── */
const ToastContext = createContext(null);

/* ── Provider ─────────────────────────────────────────────────────────── */
export function ToastProvider({ children }) {
  const [toasts, dispatch] = useReducer(reducer, []);
  const counterRef = useRef(0);

  const dismiss = useCallback((id) => {
    dispatch({ type: 'START_EXIT', id });
    setTimeout(() => dispatch({ type: 'REMOVE', id }), ANIM_DURATION);
  }, []);

  const show = useCallback((type, title, description) => {
    const id = ++counterRef.current;
    dispatch({ type: 'ADD', toast: { id, type, title, description, exiting: false } });
    const duration = DURATION[type] ?? 4000;
    const timer = setTimeout(() => dismiss(id), duration);
    /* Store timer ref on the toast object so manual dismiss can clear it.
       We can't do this in the reducer (no side effects) so we patch after. */
    return () => clearTimeout(timer);
  }, [dismiss]);

  /* Convenience shortcuts matching the public API */
  const api = {
    success: (title, description) => show('success', title, description),
    listing: (title, description) => show('listing', title, description),
    cancel:  (title, description) => show('cancel',  title, description),
    error:   (title, description) => show('error',   title, description),
  };

  return (
    <ToastContext.Provider value={api}>
      {children}
      <ToastStack toasts={toasts} onDismiss={dismiss} />
    </ToastContext.Provider>
  );
}

/* ── Hook ─────────────────────────────────────────────────────────────── */
export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used inside <ToastProvider>');
  return ctx;
}

/* ── Single toast item ────────────────────────────────────────────────── */
function ToastItem({ toast, onDismiss }) {
  const config = TYPE_CONFIG[toast.type] ?? TYPE_CONFIG.success;
  const { Icon } = config;

  return (
    <div
      role={config.ariaRole}
      aria-live={config.ariaLive}
      aria-atomic="true"
      data-exiting={toast.exiting ? 'true' : undefined}
      className="vft-toast"
      style={{
        borderLeftColor: config.accentVar,
      }}
    >
      {/* Left accent bar is provided by border-left in CSS */}
      <span className="vft-toast__icon">
        <Icon />
      </span>

      <div className="vft-toast__body">
        <p className="vft-toast__title">{toast.title}</p>
        {toast.description && (
          <p className="vft-toast__desc">{toast.description}</p>
        )}
      </div>

      <button
        type="button"
        onClick={() => onDismiss(toast.id)}
        aria-label="Dismiss notification"
        className="vft-toast__close"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
             stroke="currentColor" strokeWidth="2" aria-hidden="true">
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>
    </div>
  );
}

/* ── Stack container ──────────────────────────────────────────────────── */
function ToastStack({ toasts, onDismiss }) {
  if (toasts.length === 0) return null;
  return (
    <div className="vft-toast-stack" aria-label="Notifications">
      {toasts.map(toast => (
        <ToastItem key={toast.id} toast={toast} onDismiss={onDismiss} />
      ))}
    </div>
  );
}
