/**
 * FriendsList.jsx — Lead Island
 * Mounts via: mountIsland('friends-list-root', FriendsList)
 * PHP view: backend/src/Views/community.php
 * Page entry: src/pages/community.jsx
 *
 * Sidebar list of confirmed friends with online indicators.
 *
 * API endpoint (when USE_MOCK = false):
 *   GET /api/v1/friends
 *   Returns: { friends: [{ id, username, avatarUrl, isOnline }] }
 */

import Card     from '../../shared/atoms/Card.jsx';
import Skeleton from '../../shared/atoms/Skeleton.jsx';
import { useApi }    from '../../shared/hooks/useApi.js';
import { mockUsers, USE_MOCK } from '../../shared/mockAssets.js';

const MOCK_FRIENDS = mockUsers.map((u, i) => ({
  ...u,
  isOnline: i % 2 === 0,
}));

function FriendRow({ friend }) {
  return (
    <a
      href={`/profile?id=${friend.id}`}
      className="flex items-center gap-3 px-2 py-2 rounded-md] hover:bg-(--color-surface-2)] transition-colors group"
    >
      {/* Avatar + online dot */}
      <div className="relative shrink-0">
        <div className="w-8 h-8 rounded-full bg-(--color-accent-subtle)] border border-(--color-border)] flex items-center justify-center">
          <span className="text-xs font-bold text-(--color-accent)]">
            {friend.username[0].toUpperCase()}
          </span>
        </div>
        {/* Online indicator — colour + shape for WCAG */}
        <span
          aria-label={friend.isOnline ? 'Online' : 'Offline'}
          className={`
            absolute -bottom-0.5 -right-0.5
            w-2.5 h-2.5 rounded-full border-2 border-(--color-surface)]
            ${friend.isOnline
              ? 'bg-(--color-success)]'
              : 'bg-(--color-text-muted)]'
            }
          `}
        />
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-(--color-text-primary)] truncate group-hover:text-(--color-accent)] transition-colors">
          {friend.username}
        </p>
        <p className="text-[10px] text-(--color-text-muted)]">
          {friend.isOnline ? '● Online' : '○ Offline'}
        </p>
      </div>
    </a>
  );
}

export default function FriendsList() {
  const { data, loading, error } = useApi(
    USE_MOCK ? null : '/api/v1/friends',
    { auto: !USE_MOCK }
  );

  const friends = USE_MOCK ? MOCK_FRIENDS : (data?.friends ?? []);

  return (
    <Card variant="default" padding="md" className="flex flex-col gap-3">
      <h3 className="text-xs font-bold text-(--color-text-muted)] uppercase tracking-wide">
        Friends ({friends.length})
      </h3>

      {loading && (
        <div className="flex flex-col gap-2" role="status" aria-label="Loading friends">
          {Array.from({ length: 4 }, (_, i) => (
            <div key={i} className="flex items-center gap-3">
              <Skeleton variant="circle" width={32} height={32} />
              <Skeleton variant="block" width="60%" height={12} />
            </div>
          ))}
        </div>
      )}

      {error && (
        <p role="alert" className="text-xs text-(--color-danger)]">
          Failed to load friends: {error}
        </p>
      )}

      {!loading && !error && friends.length === 0 && (
        <p className="text-xs text-(--color-text-muted)] text-center py-4">
          No friends yet. Search for users to connect!
        </p>
      )}

      {!loading && !error && friends.length > 0 && (
        <div className="flex flex-col">
          {friends.map(friend => (
            <FriendRow key={friend.id} friend={friend} />
          ))}
        </div>
      )}
    </Card>
  );
}
