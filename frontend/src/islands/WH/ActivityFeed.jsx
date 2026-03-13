/**
 * ActivityFeed.jsx — Dev 2 Island
 * Owner: Dev 2
 * Mounts via: mountIsland('activity-feed-root', ActivityFeed)
 * PHP view: backend/src/Views/dashboard.php
 * Page entry: src/pages/dashboard.jsx
 *
 * Shows recent transaction activity for the logged-in user.
 * Each row is a buy, sell, offer received, or offer sent event.
 *
 * RULES:
 *   ✅ Import atoms from '../../shared/atoms/'
 *   ✅ USE_MOCK flag respected
 *   ✅ loading / error / success states required
 *   ❌ No hardcoded hex values
 *   ❌ No raw <button> tags
 *
 * API endpoint (when USE_MOCK = false):
 *   GET /api/v1/dashboard/activity
 *   Returns: { activities: [{ id, type, assetName, amount, counterparty, createdAt }] }
 */

import Card     from '../../shared/atoms/Card.jsx';
import Badge    from '../../shared/atoms/Badge.jsx';
import Skeleton from '../../shared/atoms/Skeleton.jsx';
import { useApi }   from '../../shared/hooks/useApi.js';
import { USE_MOCK } from '../../shared/mockAssets.js';

/* Activity type config — colour + label */
const ACTIVITY_CONFIG = {
  buy:           { label: 'Bought',        colour: 'success' },
  sell:          { label: 'Sold',          colour: 'accent'  },
  offer_sent:    { label: 'Offer Sent',    colour: 'warning' },
  offer_received:{ label: 'Offer Received',colour: 'warning' },
  offer_accepted:{ label: 'Accepted',      colour: 'success' },
  offer_rejected:{ label: 'Rejected',      colour: 'danger'  },
  listing:       { label: 'Listed',        colour: 'muted'   },
  delisted:      { label: 'Delisted',      colour: 'muted'   },
};

const MOCK_ACTIVITIES = [
  { id: 'act-001', type: 'buy',            assetName: 'Dark Sorcerer Supreme',  amount: 249.99,  counterparty: 'ShadowHawk',  createdAt: '2025-03-13T08:00:00Z' },
  { id: 'act-002', type: 'sell',           assetName: 'Neon Wraith',            amount: 2.50,    counterparty: 'NeonTrader',  createdAt: '2025-03-12T15:00:00Z' },
  { id: 'act-003', type: 'offer_received', assetName: 'Ancient Phoenix',        amount: 1100.00, counterparty: 'CelestialX',  createdAt: '2025-03-12T10:00:00Z' },
  { id: 'act-004', type: 'listing',        assetName: 'Void Architect #003',    amount: 89.50,   counterparty: null,          createdAt: '2025-03-11T11:00:00Z' },
  { id: 'act-005', type: 'offer_rejected', assetName: 'Forest Guardian',        amount: 10.00,   counterparty: 'VaultKeeper', createdAt: '2025-03-10T09:00:00Z' },
];

function TimeAgo({ isoString }) {
  const diff = Math.floor((Date.now() - new Date(isoString)) / 1000);
  if (diff < 60)    return <span>{diff}s ago</span>;
  if (diff < 3600)  return <span>{Math.floor(diff / 60)}m ago</span>;
  if (diff < 86400) return <span>{Math.floor(diff / 3600)}h ago</span>;
  return <span>{Math.floor(diff / 86400)}d ago</span>;
}

function ActivityRow({ activity }) {
  const config = ACTIVITY_CONFIG[activity.type] ?? { label: activity.type, colour: 'muted' };

  const formattedAmount = new Intl.NumberFormat('en-US', {
    style: 'currency', currency: 'USD',
  }).format(activity.amount);

  return (
    <div className="flex items-center gap-3 py-3 border-b border-(--color-border)] last:border-0">
      {/* Type badge */}
      <Badge label={config.label} colour={config.colour} size="sm" />

      {/* Asset info */}
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold text-(--color-text-primary)] truncate">
          {activity.assetName}
        </p>
        {activity.counterparty && (
          <p className="text-[10px] text-(--color-text-muted)]">
            with {activity.counterparty}
          </p>
        )}
      </div>

      {/* Amount + time */}
      <div className="text-right shrink-0">
        <p className="text-xs font-bold text-(--color-text-primary)]">{formattedAmount}</p>
        <p className="text-[10px] text-(--color-text-muted)]">
          <TimeAgo isoString={activity.createdAt} />
        </p>
      </div>
    </div>
  );
}

export default function ActivityFeed() {
  const { data, loading, error } = useApi(
    USE_MOCK ? null : '/api/v1/dashboard/activity',
    { auto: !USE_MOCK }
  );

  const activities = USE_MOCK ? MOCK_ACTIVITIES : (data?.activities ?? []);

  if (loading) {
    return (
      <Card variant="default" padding="md">
        <div className="flex flex-col gap-3" role="status" aria-label="Loading activity">
          {Array.from({ length: 4 }, (_, i) => (
            <div key={i} className="flex items-center gap-3">
              <Skeleton variant="block" width={64}  height={20} />
              <Skeleton variant="block" width="40%" height={14} />
              <Skeleton variant="block" width={60}  height={14} className="ml-auto" />
            </div>
          ))}
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <p role="alert" className="text-sm text-(--color-danger)]">
        Failed to load activity: {error}
      </p>
    );
  }

  if (activities.length === 0) {
    return (
      <Card variant="inset" padding="lg" className="text-center">
        <p className="text-sm text-(--color-text-muted)]">No recent activity.</p>
      </Card>
    );
  }

  return (
    <Card variant="default" padding="md" className="flex flex-col">
      <h3 className="text-sm font-bold text-(--color-text-primary)] mb-2">
        Recent Activity
      </h3>
      {activities.map(activity => (
        <ActivityRow key={activity.id} activity={activity} />
      ))}
      {/* TODO Dev 2: add "Load more" button for pagination */}
    </Card>
  );
}
