/**
 * ActivityFeed.jsx — Dev 2 Island
 * Owner: Dev 2
 * Mounts via: mountIsland('activity-feed-root', ActivityFeed)
 * PHP view: backend/src/Views/dashboard.php
 * Page entry: src/pages/dashboard.jsx
 *
 * Shows recent transaction activity for the logged-in user.
 * Each row is a buy, sell, offer received, or offer sent event.
 */

import Card     from '../../shared/atoms/Card.jsx';
import Badge    from '../../shared/atoms/Badge.jsx';
import Skeleton from '../../shared/atoms/Skeleton.jsx';
import { useApi }   from '../../shared/hooks/useApi.js';

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

function TimeAgo({ isoString }) {
  const diff = Math.floor((Date.now() - new Date(isoString)) / 1000);
  let label;
  if (diff < 60)    label = `${diff}s ago`;
  else if (diff < 3600)  label = `${Math.floor(diff / 60)}m ago`;
  else if (diff < 86400) label = `${Math.floor(diff / 3600)}h ago`;
  else               label = `${Math.floor(diff / 86400)}d ago`;
  return <time dateTime={isoString}>{label}</time>;
}

function ActivityRow({ activity }) {
  const config = ACTIVITY_CONFIG[activity.type] ?? { label: activity.type, colour: 'muted' };

  const formattedAmount = new Intl.NumberFormat('en-US', {
    style: 'currency', currency: 'USD',
  }).format(activity.amount);

  return (
    <div className="flex items-center gap-3 py-3 border-b border-(--color-border) last:border-0">
      {/* Type badge */}
      <Badge label={config.label} colour={config.colour} size="sm" />

      {/* Asset info */}
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold text-(--color-text-primary) truncate">
          {activity.assetName}
        </p>
        {activity.counterparty && (
          <p className="text-[10px] text-(--color-text-muted)">
            with {activity.counterparty}
          </p>
        )}
      </div>

      {/* Amount + time */}
      <div className="text-right shrink-0">
        <p className="text-xs font-bold text-(--color-text-primary)">{formattedAmount}</p>
        <p className="text-[10px] text-(--color-text-muted)">
          <TimeAgo isoString={activity.createdAt} />
        </p>
      </div>
    </div>
  );
}

export default function ActivityFeed() {
  const { data, loading, error } = useApi('/api/v1/dashboard/activity');

  const activities = data?.activities ?? [];

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
      <p role="alert" className="text-sm text-(--color-danger)">
        Failed to load activity: {error}
      </p>
    );
  }

  if (activities.length === 0) {
    return (
      <Card variant="inset" padding="lg" className="text-center">
        <p className="text-sm text-(--color-text-muted)">No recent activity.</p>
      </Card>
    );
  }

  return (
    <Card variant="default" padding="md" className="flex flex-col">
      <h3 className="text-sm font-bold text-(--color-text-primary) mb-2">
        Recent Activity
      </h3>
      {activities.map(activity => (
        <ActivityRow key={activity.id} activity={activity} />
      ))}
    </Card>
  );
}
