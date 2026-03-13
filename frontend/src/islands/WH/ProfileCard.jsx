/**
 * ProfileCard.jsx — Dev 2 Island
 * Owner: Dev 2
 * Mounts via: mountIsland('profile-card-root', ProfileCard)
 * PHP view: backend/src/Views/profile.php
 * data-props: { userId }
 *
 * API endpoint (when USE_MOCK = false):
 *   GET /api/v1/users/:userId/profile
 *   Returns: { user, stats, recentListings }
 *
 * IMPORTANT: Profile has soft-delete (deleted_at timestamp).
 * If user.deletedAt is set, show grace period banner, not full profile.
 */

import Card     from '../../shared/atoms/Card.jsx';
import Badge    from '../../shared/atoms/Badge.jsx';
import Button   from '../../shared/atoms/Button.jsx';
import Skeleton from '../../shared/atoms/Skeleton.jsx';
import { useApi }   from '../../shared/hooks/useApi.js';
import { mockUsers, USE_MOCK } from '../../shared/mockAssets.js';

const MOCK_PROFILE = {
  user:  { ...mockUsers[0], bio: 'Trading rare digital assets since Core Drop 2024.' },
  stats: { totalSales: 142, totalVolume: '$28,400', itemsOwned: 37, joinedAt: '2024-01-15' },
  recentListings: [],
};

export default function ProfileCard({ userId }) {
  const { data, loading, error } = useApi(
    USE_MOCK ? null : `/api/v1/users/${userId}/profile`,
    { auto: !USE_MOCK }
  );

  const profile = USE_MOCK ? MOCK_PROFILE : data;

  if (loading) return <Skeleton variant="card" label="Loading profile" />;

  if (error) {
    return (
      <p role="alert" className="text-(--color-danger) text-sm">
        Failed to load profile: {error}
      </p>
    );
  }

  // Soft-delete grace period banner
  if (profile?.user?.deletedAt) {
    const graceEnd = new Date(profile.user.deletedAt);
    graceEnd.setDate(graceEnd.getDate() + 30);
    return (
      <Card variant="default" padding="lg" className="border-(--color-warning) bg-(--color-warning-subtle)">
        <p className="text-sm font-semibold text-(--color-warning)">
          ⚠️ This account is scheduled for deletion on {graceEnd.toLocaleDateString()}.
        </p>
        <p className="text-xs text-(--color-text-muted) mt-1">
          Contact support to restore this account before the deadline.
        </p>
      </Card>
    );
  }

  const { user, stats } = profile ?? {};

  return (
    <Card variant="default" padding="lg" className="flex flex-col gap-5">
      {/* Avatar + name */}
      <div className="flex items-center gap-4">
        <div
          className="w-14 h-14 rounded-full bg-(--color-accent-subtle) border-2 border-(--color-accent) flex items-center justify-center shrink-0"
          aria-hidden="true"
        >
          <span className="text-lg font-bold text-(--color-accent)">
            {user?.username?.[0]?.toUpperCase() ?? '?'}
          </span>
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-(--color-text-primary)">{user?.username}</h2>
            {user?.isVerified && (
              <Badge label="Verified" colour="accent" size="sm" />
            )}
          </div>
          <p className="text-xs text-(--color-text-muted)">
            Joined {new Date(stats?.joinedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short' })}
          </p>
        </div>
      </div>

      {/* Bio */}
      {user?.bio && (
        <p className="text-sm text-(--color-text-secondary)">{user.bio}</p>
      )}

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 border-t border-(--color-border) pt-4">
        {[
          { label: 'Sales',  value: stats?.totalSales },
          { label: 'Volume', value: stats?.totalVolume },
          { label: 'Owned',  value: stats?.itemsOwned },
        ].map(({ label, value }) => (
          <div key={label} className="text-center">
            <p className="text-base font-bold text-(--color-text-primary)">{value ?? '—'}</p>
            <p className="text-[10px] text-(--color-text-muted) uppercase tracking-wide">{label}</p>
          </div>
        ))}
      </div>

      {/* TODO Dev 2: Add Edit Profile button (only if userId === currentUserId from data-props) */}
    </Card>
  );
}
