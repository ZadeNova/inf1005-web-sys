/**
 * SearchUsers.jsx — Lead Island
 * Mounts via: mountIsland('search-users-root', SearchUsers)
 * PHP view: backend/src/Views/community.php
 * Page entry: src/pages/community.jsx
 *
 * Search bar that finds users by username.
 * Allows sending friend requests directly from results.
 *
 * API endpoints (when USE_MOCK = false):
 *   GET  /api/v1/users/search?q=username
 *   POST /api/v1/friends/requests  Body: { targetUserId }
 */

import { useState, useRef }  from 'react';
import Card                  from '../../shared/atoms/Card.jsx';
import Button                from '../../shared/atoms/Button.jsx';
import Skeleton              from '../../shared/atoms/Skeleton.jsx';
import { mockUsers, USE_MOCK } from '../../shared/mockAssets.js';

/* Search icon */
const SearchIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true">
    <circle cx="11" cy="11" r="8"/>
    <path d="m21 21-4.35-4.35"/>
  </svg>
);

function UserResult({ user, onSendRequest }) {
  const [sent,    setSent]    = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSend() {
    setLoading(true);
    await onSendRequest(user.id);
    setSent(true);
    setLoading(false);
  }

  return (
    <div className="flex items-center gap-3 py-2">
      <div className="w-8 h-8 rounded-full bg-(--color-accent-subtle) border border-(--color-border) flex items-center justify-center shrink-0">
        <span className="text-xs font-bold text-(--color-accent)]">
          {user.username[0].toUpperCase()}
        </span>
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold text-(--color-text-primary)] truncate">
          {user.username}
        </p>
        {user.isVerified && (
          <p className="text-[10px] text-(--color-accent)">✓ Verified</p>
        )}
      </div>

      {sent ? (
        <span className="text-[10px] text-(--color-success)] font-medium">Sent!</span>
      ) : (
        <Button
          variant="secondary"
          size="sm"
          loading={loading}
          onClick={handleSend}
          aria-label={`Send friend request to ${user.username}`}
        >
          + Add
        </Button>
      )}
    </div>
  );
}

export default function SearchUsers() {
  const [query,   setQuery]   = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const debounceRef = useRef(null);

  function handleInput(e) {
    const q = e.target.value;
    setQuery(q);

    clearTimeout(debounceRef.current);
    if (!q.trim()) { setResults([]); setSearched(false); return; }

    debounceRef.current = setTimeout(() => {
      performSearch(q.trim());
    }, 300);
  }

  async function performSearch(q) {
    setLoading(true);
    setSearched(true);

    if (USE_MOCK) {
      // Filter mock users by username
      const filtered = mockUsers.filter(u =>
        u.username.toLowerCase().includes(q.toLowerCase())
      );
      setResults(filtered);
      setLoading(false);
      return;
    }

    try {
      const res  = await fetch(`/api/v1/users/search?q=${encodeURIComponent(q)}`, {
        headers: { 'Accept': 'application/json' },
      });
      const data = await res.json();
      setResults(data.users ?? []);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  }

  async function handleSendRequest(userId) {
    if (USE_MOCK) {
      console.log('[SearchUsers] MOCK send request to:', userId);
      return;
    }
    // TODO Lead: POST /api/v1/friends/requests { targetUserId: userId }
  }

  return (
    <Card variant="default" padding="md" className="flex flex-col gap-3">
      <h3 className="text-xs font-bold text-(--color-text-muted) uppercase tracking-wide">
        Find Users
      </h3>

      {/* Search input */}
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-(--color-text-muted)]">
          <SearchIcon />
        </span>
        <input
          type="search"
          placeholder="Search by username..."
          value={query}
          onChange={handleInput}
          aria-label="Search users"
          className="
            w-full pl-9 pr-3 py-2 text-xs
            rounded-md
            bg-(--color-input-bg)]
            border border-(--color-input-border)]
            text-(--color-text-primary)]
            placeholder:text-(--color-input-placeholder)]
            focus:outline-none focus:border-(--color-input-focus)]
            transition-colors
          "
        />
      </div>

      {/* Results */}
      {loading && (
        <div className="flex flex-col gap-2" role="status" aria-label="Searching">
          {Array.from({ length: 2 }, (_, i) => (
            <div key={i} className="flex items-center gap-3">
              <Skeleton variant="circle" width={32} height={32} />
              <Skeleton variant="block" width="50%" height={12} />
            </div>
          ))}
        </div>
      )}

      {!loading && searched && results.length === 0 && (
        <p className="text-xs text-(--color-text-muted)] text-center py-2">
          No users found for "{query}"
        </p>
      )}

      {!loading && results.length > 0 && (
        <div className="flex flex-col divide-y divide-(--color-border)">
          {results.map(user => (
            <UserResult
              key={user.id}
              user={user}
              onSendRequest={handleSendRequest}
            />
          ))}
        </div>
      )}
    </Card>
  );
}
