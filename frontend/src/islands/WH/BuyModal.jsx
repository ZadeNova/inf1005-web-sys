/**
 * BuyModal.jsx — Shared Buy Confirmation Modal
 * Owner: WH (Dev 2)
 * Not mounted as a standalone island — imported and used inside ListingsGrid.
 *
 * Usage:
 *   <BuyModal listing={listing} walletBalance={balance} onClose={fn} onSuccess={fn} />
 *
 * API endpoint:
 *   POST /api/v1/market/buy
 *   Body:    { listingId }
 *   Success: { success, transactionRef, assetName, price }
 *   Error:   { success: false, message }
 */

import { useState } from 'react';
import Card    from '../../shared/atoms/Card.jsx';
import Button  from '../../shared/atoms/Button.jsx';
import { RarityBadge, ConditionBadge } from '../../shared/atoms/Badge.jsx';
import { usePost }  from '../../shared/hooks/useApi.js';
import { USE_MOCK } from '../../shared/mockAssets.js';

/* ── Icons ─────────────────────────────────────────────────────────────── */
const CheckIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}
       className="w-5 h-5" aria-hidden="true">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);

const XIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}
       className="w-5 h-5" aria-hidden="true">
    <line x1="18" y1="6" x2="6" y2="18"/>
    <line x1="6"  y1="6" x2="18" y2="18"/>
  </svg>
);

/* ── Modal states ────────────────────────────────────────────────────────
   idle → loading → success | error
   ─────────────────────────────────────────────────────────────────────── */
export default function BuyModal({ listing, walletBalance, onClose, onSuccess }) {
  const [phase,   setPhase]   = useState('idle');   // idle | loading | success | error
  const [message, setMessage] = useState('');

  const { execute: postBuy } = usePost('/api/v1/market/buy');

  const canAfford   = walletBalance === null || walletBalance >= listing.price;
  const balanceAfter = walletBalance !== null
    ? (walletBalance - listing.price).toFixed(2)
    : null;

  async function handleConfirm() {
    setPhase('loading');
    setMessage('');

    if (USE_MOCK) {
      await new Promise(r => setTimeout(r, 900));
      setPhase('success');
      setMessage(`You now own ${listing.asset?.name ?? listing.name}.`);
      onSuccess?.({ assetName: listing.asset?.name ?? listing.name, price: listing.price });
      return;
    }

    try {
      const result = await postBuy({ listingId: listing.id });
      setPhase('success');
      setMessage(`You now own ${result.assetName}.`);
      onSuccess?.(result);
    } catch (err) {
      setPhase('error');
      setMessage(err.message ?? 'Purchase failed. Please try again.');
    }
  }

  /* Trap focus inside modal on mount */
  const assetName      = listing.asset?.name      ?? listing.name      ?? 'Unknown Asset';
  const assetRarity    = listing.asset?.rarity    ?? listing.rarity    ?? '';
  const assetCondition = listing.asset?.condition ?? listing.condition ?? '';
  const assetCollection= listing.asset?.collection?? listing.collection?? '';

  return (
    /* ── Backdrop ──────────────────────────────────────────────────── */
    <div role="dialog"
         aria-modal="true"
         aria-labelledby="buy-modal-title"
         className="fixed inset-0 z-50 flex items-center justify-center
                    bg-black/60 px-4"
         onClick={e => { if (e.target === e.currentTarget) onClose(); }}>

      <Card variant="default" padding="lg" className="w-full max-w-sm flex flex-col gap-5">

        {/* ── Header ─────────────────────────────────────────────── */}
        <div className="flex items-start justify-between gap-3">
          <h2 id="buy-modal-title"
              className="text-base font-bold text-(--color-text-primary)">
            {phase === 'success' ? 'Purchase complete!' : 'Confirm purchase'}
          </h2>
          <button type="button"
                  onClick={onClose}
                  aria-label="Close modal"
                  className="text-(--color-text-muted) hover:text-(--color-text-primary)
                             transition-colors shrink-0">
            <XIcon />
          </button>
        </div>

        {/* ── Success state ──────────────────────────────────────── */}
        {phase === 'success' && (
          <div className="flex flex-col items-center gap-3 py-4 text-center">
            <span className="w-12 h-12 rounded-full bg-(--color-success-subtle)
                             flex items-center justify-center text-(--color-success)">
              <CheckIcon />
            </span>
            <p className="text-sm text-(--color-text-primary) font-semibold">
              {message}
            </p>
            <p className="text-xs text-(--color-text-muted)">
              Check your profile to view your new asset.
            </p>
            <Button variant="primary" size="md" onClick={onClose} className="mt-2">
              Done
            </Button>
          </div>
        )}

        {/* ── Error state ────────────────────────────────────────── */}
        {phase === 'error' && (
          <div className="flex flex-col gap-3">
            <p role="alert"
               className="text-sm text-(--color-danger)
                          bg-(--color-danger-subtle) border border-(--color-danger)
                          rounded-md px-3 py-2">
              {message}
            </p>
            <div className="flex gap-2 justify-end">
              <Button variant="secondary" size="sm" onClick={onClose}>
                Cancel
              </Button>
              <Button variant="primary" size="sm"
                      onClick={() => setPhase('idle')}>
                Try again
              </Button>
            </div>
          </div>
        )}

        {/* ── Idle / loading state ───────────────────────────────── */}
        {(phase === 'idle' || phase === 'loading') && (
          <>
            {/* Asset summary */}
            <div className="flex items-center gap-3 p-3 rounded-lg
                            bg-(--color-surface-2) border border-(--color-border)">
              <div className="w-14 h-14 rounded-md bg-(--color-surface)
                              border border-(--color-border)
                              flex items-center justify-center shrink-0"
                   aria-hidden="true">
                <span className="text-xs text-(--color-text-muted)">IMG</span>
              </div>
              <div className="flex flex-col gap-1 min-w-0">
                <p className="text-sm font-bold text-(--color-text-primary) truncate">
                  {assetName}
                </p>
                <div className="flex flex-wrap gap-1">
                  {assetRarity    && <RarityBadge    tier={assetRarity}       size="sm" />}
                  {assetCondition && <ConditionBadge condition={assetCondition} size="sm" />}
                </div>
                <p className="text-xs text-(--color-text-muted) truncate">
                  {assetCollection}
                </p>
              </div>
            </div>

            {/* Price breakdown */}
            <div className="flex flex-col gap-2 text-sm">
              <div className="flex justify-between">
                <span className="text-(--color-text-secondary)">Price</span>
                <span className="font-bold text-(--color-text-primary)">
                  ${listing.price.toLocaleString()}
                </span>
              </div>

              {walletBalance !== null && (
                <>
                  <div className="flex justify-between">
                    <span className="text-(--color-text-secondary)">Wallet balance</span>
                    <span className="text-(--color-text-primary)">
                      ${walletBalance.toLocaleString()}
                    </span>
                  </div>
                  <div className="h-px bg-(--color-border)" aria-hidden="true"/>
                  <div className="flex justify-between font-semibold">
                    <span className="text-(--color-text-secondary)">Balance after</span>
                    <span className={canAfford
                      ? 'text-(--color-success)'
                      : 'text-(--color-danger)'}>
                      ${balanceAfter}
                    </span>
                  </div>
                </>
              )}
            </div>

            {/* Insufficient funds warning */}
            {!canAfford && (
              <p role="alert"
                 className="text-sm text-(--color-danger)
                            bg-(--color-danger-subtle) border border-(--color-danger)
                            rounded-md px-3 py-2">
                Insufficient funds. Top up your wallet to proceed.
              </p>
            )}

            {/* Actions */}
            <div className="flex gap-2 justify-end">
              <Button variant="secondary" size="md"
                      onClick={onClose}
                      disabled={phase === 'loading'}>
                Cancel
              </Button>
              <Button variant="primary" size="md"
                      loading={phase === 'loading'}
                      disabled={!canAfford}
                      onClick={handleConfirm}>
                Confirm purchase
              </Button>
            </div>
          </>
        )}

      </Card>
    </div>
  );
}
