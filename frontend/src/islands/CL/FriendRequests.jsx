/**
 * FriendRequests.jsx — Lead Island
 * Mounts via: mountIsland('friend-requests-root', FriendRequests)
 * PHP view: backend/src/Views/community.php
 * Page entry: src/pages/community.jsx
 *
 * Shows pending incoming friend requests with Accept / Decline actions.
 *
 * API endpoints (when USE_MOCK = false):
 *   GET    /api/v1/friends/requests
 *   POST   /api/v1/friends/requests/:id/accept
 *   DELETE /api/v1/friends/requests/:id
 */

import { useState }  from 'react';
import Card          from '../../shared/atoms/Card.jsx';
import Button        from '../../shared/atoms/Button.jsx';
import Skeleton      from '../../shared/atoms/Skeleton.jsx';
import { useApi, usePost, useDelete } from '../../shared/hooks/useApi.js';
import { mockUsers, USE_MOCK }        from '../../shared/mockAssets.js';

const MOCK_REQUESTS = [
  { id: 'req-001', from: mockUsers[1], sentAt: '2025-03-12T10:00:00Z' },
  { id: 'req-002', from: mockUsers[3], sentAt: '2025-03-13T06:00:00Z' },
];

function RequestRow({ request, onAccept, onDecline }) {
  const [accepting, setAccepting] = useState(false);
  const [declining, setDeclining] = useState(false);

  async function handleAccept() {
    setAccepting(true);
    await onAccept(request.id);
    setAccepting(false);
  }

  async function handleDecline() {
    setDeclining(true);
    await onDecline(request.id);
    setDeclining(false);
  }

  return (
    <div className="flex items-center gap-3 py-2">
      {/* Avatar */}
      <div className="w-9 h-9 rounded-full bg-(--color-accent-subtle)] border border-(--color-border)] flex items-center justify-center shrink-0">
        <span className="text-xs font-bold text-(--color-accent)]">
          {request.from.username[0].toUpperCase()}
        </span>
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold text-(--color-text-primary)] truncate">
          {request.from.username}
        </p>
        <p className="text-[10px] text-(--color-text-muted)]">wants to be friends</p>
      </div>

      {/* Actions */}
      <div className="flex gap-1.5 shrink-0">
        <Button
          variant="primary"
          size="sm"
          loading={accepting}
          onClick={handleAccept}
          aria-label={`Accept friend request from ${request.from.username}`}
        >
          Accept
        </Button>
        <Button
          variant="secondary"
          size="sm"
          loading={declining}
          onClick={handleDecline}
          aria-label={`Decline friend request from ${request.from.username}`}
        >
          Decline
        </Button>
      </div>
    </div>
  );
}

export default function FriendRequests() {
  const [requests, setRequests] = useState(
    USE_MOCK ? MOCK_REQUESTS : []
  );

  const { loading, error } = useApi(
    USE_MOCK ? null : '/api/v1/friends/requests',
    { auto: !USE_MOCK }
  );

  async function handleAccept(requestId) {
    if (USE_MOCK) {
      setRequests(prev => prev.filter(r => r.id !== requestId));
      console.log('[FriendRequests] MOCK accept:', requestId);
      return;
    }
    // TODO Lead: POST /api/v1/friends/requests/:id/accept
  }

  async function handleDecline(requestId) {
    if (USE_MOCK) {
      setRequests(prev => prev.filter(r => r.id !== requestId));
      console.log('[FriendRequests] MOCK decline:', requestId);
      return;
    }
    // TODO Lead: DELETE /api/v1/friends/requests/:id
  }

  if (loading) {
    return (
      <Card variant="default" padding="md">
        <Skeleton variant="text" lines={2} label="Loading friend requests" />
      </Card>
    );
  }

  if (error) {
    return (
      <p role="alert" className="text-xs text-(--color-danger)]">
        Failed to load requests: {error}
      </p>
    );
  }

  if (requests.length === 0) return null; // Hide widget when no pending requests

  return (
    <Card variant="default" padding="md" className="flex flex-col gap-2">
      <h3 className="text-xs font-bold text-(--color-text-muted)] uppercase tracking-wide">
        Friend Requests ({requests.length})
      </h3>
      <div className="flex flex-col divide-y divide-(--color-border)">
        {requests.map(req => (
          <RequestRow
            key={req.id}
            request={req}
            onAccept={handleAccept}
            onDecline={handleDecline}
          />
        ))}
      </div>
    </Card>
  );
}
