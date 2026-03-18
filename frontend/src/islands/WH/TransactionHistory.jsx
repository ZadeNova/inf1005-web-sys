/**
 * TransactionHistory.jsx — Dev 2 Island
 * Owner: WH (Dev 2)
 * Mounts via: mountIsland('transaction-history-root', TransactionHistory)
 * PHP view: backend/src/Views/dashboard.php → <div id="transaction-history-root">
 *
 * Chronological list of completed buy/sell transactions.
 * Shows: asset name, role (buy/sell), price, counterparty, timestamp.
 * Filters: type (buy/sell), rarity.
 * Show/hide toggle for privacy.
 *
 * API endpoint (when USE_MOCK = false):
 *   GET /api/v1/user/transactions
 *   Returns: { transactions: [{ id, asset_name, rarity, price,
 *               buyer_username, seller_username, role, completed_at }] }
 */

import { useState, useMemo } from 'react';
import Card     from '../../shared/atoms/Card.jsx';
import Button   from '../../shared/atoms/Button.jsx';
import Skeleton from '../../shared/atoms/Skeleton.jsx';
import { RarityBadge } from '../../shared/atoms/Badge.jsx';
import { useApi }              from '../../shared/hooks/useApi.js';
import { RARITY, USE_MOCK }    from '../../shared/mockAssets.js';

/* ── Mock data ──────────────────────────────────────────────────────────── */
const MOCK_TRANSACTIONS = [
  { id: 'tx-001', asset_name: 'Shadowfall Genesis #001', rarity: RARITY.SECRET_RARE, price: 4200.00, role: 'buy',  buyer_username: '0xVault',    seller_username: 'NeonTrader',  completed_at: '2025-03-01T10:00:00Z' },
  { id: 'tx-002', asset_name: 'Ancient Phoenix',         rarity: RARITY.SECRET_RARE, price: 1299.00, role: 'sell', buyer_username: 'ShadowHawk',  seller_username: '0xVault',     completed_at: '2025-03-05T14:22:00Z' },
  { id: 'tx-003', asset_name: 'Dark Sorcerer Supreme',   rarity: RARITY.ULTRA_RARE,  price: 249.99,  role: 'buy',  buyer_username: '0xVault',    seller_username: 'CelestialX',  completed_at: '2025-03-08T09:10:00Z' },
  { id: 'tx-004', asset_name: 'Forest Guardian',         rarity: RARITY.UNCOMMON,    price: 12.99,   role: 'sell', buyer_username: 'VaultKeeper', seller_username: '0xVault',     completed_at: '2025-03-10T17:45:00Z' },
  { id: 'tx-005', asset_name: 'Void Architect #003',     rarity: RARITY.RARE,        price: 89.50,   role: 'buy',  buyer_username: '0xVault',    seller_username: 'NeonTrader',  completed_at: '2025-03-11T11:00:00Z' },
  { id: 'tx-006', asset_name: 'Neon Wraith',             rarity: RARITY.COMMON,      price: 2.50,    role: 'sell', buyer_username: 'NeonTrader',  seller_username: '0xVault',     completed_at: '2025-03-12T08:30:00Z' },
];

/* ── Icons ─────────────────────────────────────────────────────────────── */
const EyeIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}
       className="w-4 h-4" aria-hidden="true">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
    <circle cx="12" cy="12" r="3"/>
  </svg>
);
const EyeOffIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}
       className="w-4 h-4" aria-hidden="true">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
    <line x1="1" y1="1" x2="23" y2="23"/>
  </svg>
);

/* ── Helpers ────────────────────────────────────────────────────────────── */
function formatDate(iso) {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  });
}

/* ════════════════════════════════════════════════════════════════════════
   MAIN EXPORT
   ════════════════════════════════════════════════════════════════════════ */
export default function TransactionHistory() {
  const [visible,     setVisible]     = useState(true);
  const [typeFilter,  setTypeFilter]  = useState('');    // '' | 'buy' | 'sell'
  const [rarityFilter,setRarityFilter]= useState('');

  const { data, loading, error } = useApi(
    USE_MOCK ? null : '/api/v1/user/transactions',
    { auto: !USE_MOCK }
  );

  const raw = USE_MOCK ? MOCK_TRANSACTIONS : (data?.transactions ?? []);

  const filtered = useMemo(() => raw.filter(tx => {
    if (typeFilter  && tx.role   !== typeFilter)  return false;
    if (rarityFilter && tx.rarity !== rarityFilter) return false;
    return true;
  }), [raw, typeFilter, rarityFilter]);

  const selectClass = 'bg-(--color-surface-2) border border-(--color-border) ' +
                      'text-(--color-text-primary) text-sm rounded-md px-3 py-2';

  /* ── Loading ─────────────────────────────────────────────────────── */
  if (loading) {
    return (
      <Card variant="default" padding="md" className="flex flex-col gap-3">
        <Skeleton variant="block" height={20} width="40%" label="Loading transactions" />
        {[1,2,3,4].map(i => (
          <div key={i} className="flex items-center gap-3 py-3
                                   border-b border-(--color-border) last:border-0">
            <Skeleton variant="block" width={48} height={20} />
            <Skeleton variant="block" height={14} className="flex-1" />
            <Skeleton variant="block" width={64} height={14} />
          </div>
        ))}
      </Card>
    );
  }

  /* ── Error ───────────────────────────────────────────────────────── */
  if (error) {
    return (
      <Card variant="default" padding="md">
        <p role="alert" className="text-sm text-(--color-danger)">
          Failed to load transactions: {error}
        </p>
      </Card>
    );
  }

  /* ── Render ──────────────────────────────────────────────────────── */
  return (
    <Card variant="default" padding="md" className="flex flex-col gap-4">

      {/* ── Header row ─────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-3 justify-between">
        <h2 className="text-base font-bold text-(--color-text-primary)">
          Transaction History
        </h2>

        <div className="flex flex-wrap items-center gap-2">
          {/* Rarity filter */}
          <select value={rarityFilter}
                  onChange={e => setRarityFilter(e.target.value)}
                  className={selectClass}
                  aria-label="Filter by rarity">
            <option value="">All Rarities</option>
            {Object.values(RARITY).map(r => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>

          {/* Buy / Sell type toggle */}
          <div className="flex gap-1 border border-(--color-border) rounded-md p-0.5"
               role="group" aria-label="Filter by transaction type">
            {['buy', 'sell'].map(type => (
              <button key={type}
                      type="button"
                      onClick={() => setTypeFilter(f => f === type ? '' : type)}
                      aria-pressed={typeFilter === type}
                      className={`px-2.5 py-1 rounded text-xs font-semibold transition-colors
                        ${typeFilter === type
                          ? type === 'buy'
                            ? 'bg-(--color-success) text-white'
                            : 'bg-(--color-danger) text-white'
                          : 'text-(--color-text-muted) hover:text-(--color-text-primary)'}`}>
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </button>
            ))}
          </div>

          {/* Show / hide toggle */}
          <button type="button"
                  onClick={() => setVisible(v => !v)}
                  aria-label={visible ? 'Hide transaction history' : 'Show transaction history'}
                  className="flex items-center gap-1.5 text-xs
                             text-(--color-text-muted) hover:text-(--color-accent)
                             transition-colors">
            {visible ? <EyeIcon /> : <EyeOffIcon />}
            {visible ? 'Hide' : 'Show'}
          </button>
        </div>
      </div>

      {/* ── Hidden state ───────────────────────────────────────── */}
      {!visible && (
        <div className="flex flex-col items-center gap-2 py-8">
          <EyeOffIcon />
          <p className="text-sm text-(--color-text-muted)">
            Transaction history is hidden
          </p>
          <button type="button"
                  onClick={() => setVisible(true)}
                  className="text-xs text-(--color-accent) hover:underline">
            Show history
          </button>
        </div>
      )}

      {/* ── Empty state ────────────────────────────────────────── */}
      {visible && filtered.length === 0 && (
        <p className="text-sm text-(--color-text-muted) text-center py-10">
          No transactions found.
        </p>
      )}

      {/* ── Transaction rows ───────────────────────────────────── */}
      {visible && filtered.length > 0 && (
        <ul className="flex flex-col gap-0" role="list">
          {filtered.map((tx, idx) => {
            const counterparty = tx.role === 'buy'
              ? tx.seller_username
              : tx.buyer_username;

            return (
              <li key={tx.id}
                  className={`flex items-center gap-3 py-3 flex-wrap sm:flex-nowrap
                    ${idx < filtered.length - 1 ? 'border-b border-(--color-border)' : ''}`}>

                {/* Type badge */}
                <span className={`text-xs font-bold px-2 py-1 rounded shrink-0
                  ${tx.role === 'buy'
                    ? 'bg-(--color-success-subtle) text-(--color-success)'
                    : 'bg-(--color-danger-subtle)  text-(--color-danger)'}`}>
                  {tx.role.toUpperCase()}
                </span>

                {/* Asset name */}
                <p className="text-sm font-semibold text-(--color-text-primary)
                              flex-1 truncate min-w-0">
                  {tx.asset_name}
                </p>

                {/* Rarity badge */}
                <div className="hidden sm:block shrink-0">
                  <RarityBadge tier={tx.rarity} size="sm" />
                </div>

                {/* Counterparty */}
                <p className="text-xs text-(--color-text-muted) shrink-0 hidden md:block">
                  {tx.role === 'buy' ? 'from' : 'to'}{' '}
                  <span className="font-semibold text-(--color-text-secondary)">
                    {counterparty}
                  </span>
                </p>

                {/* Price */}
                <p className={`text-sm font-bold shrink-0
                  ${tx.role === 'buy'
                    ? 'text-(--color-danger)'
                    : 'text-(--color-success)'}`}>
                  {tx.role === 'buy' ? '−' : '+'}
                  ${Number(tx.price).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </p>

                {/* Date */}
                <p className="text-xs text-(--color-text-muted) shrink-0">
                  {formatDate(tx.completed_at)}
                </p>
              </li>
            );
          })}
        </ul>
      )}

    </Card>
  );
}
