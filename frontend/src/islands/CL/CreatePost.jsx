/**
 * CreatePost.jsx — Lead Island
 * Mounts via: mountIsland('create-post-root', CreatePost)
 * PHP view: backend/src/Views/community.php
 * Page entry: src/pages/community.jsx
 *
 * Post composer — text input with submit.
 * On success, parent page should refetch PostFeed.
 *
 * API endpoint (when USE_MOCK = false):
 *   POST /api/v1/community/posts
 *   Body:    { content }
 *   Returns: { post }
 */

import { useState }  from 'react';
import Card          from '../../shared/atoms/Card.jsx';
import Button        from '../../shared/atoms/Button.jsx';
import { usePost }   from '../../shared/hooks/useApi.js';
import { mockUsers, USE_MOCK } from '../../shared/mockAssets.js';

const MAX_CHARS = 500;

export default function CreatePost({ onPostCreated }) {
  const [content,   setContent]   = useState('');
  const [submitted, setSubmitted] = useState(false);

  const { execute: submitPost, loading } = usePost('/api/v1/community/posts');

  const remaining  = MAX_CHARS - content.length;
  const isOverLimit = remaining < 0;
  const isEmpty    = content.trim().length === 0;

  async function handleSubmit() {
    if (isEmpty || isOverLimit) return;

    if (USE_MOCK) {
      console.log('[CreatePost] MOCK submit:', content);
      setContent('');
      setSubmitted(true);
      setTimeout(() => setSubmitted(false), 2000);
      onPostCreated?.();
      return;
    }

    try {
      await submitPost({ content });
      setContent('');
      onPostCreated?.();
    } catch (err) {
      console.error('[CreatePost] Error:', err.message);
    }
  }

  // Current user avatar initial — TODO: replace with real user from data-props
  const userInitial = mockUsers[0].username[0].toUpperCase();

  return (
    <Card variant="default" padding="md" className="flex flex-col gap-3">
      <div className="flex gap-3">
        {/* Avatar */}
        <div className="w-9 h-9 rounded-full bg-(--color-accent-subtle)] border border-(--color-accent)] flex items-center justify-center shrink-0 mt-0.5">
          <span className="text-xs font-bold text-(--color-accent)]">{userInitial}</span>
        </div>

        {/* Textarea */}
        <textarea
          rows={3}
          placeholder="Share something with the community..."
          value={content}
          onChange={e => setContent(e.target.value)}
          aria-label="Post content"
          aria-describedby="char-count"
          className="
            flex-1 px-3 py-2.5 text-sm
            rounded-md]
            bg-(--color-input-bg)]
            border border-(--color-input-border)]
            text-(--color-text-primary)]
            placeholder:text-(--color-input-placeholder)]
            focus:outline-none focus:border-(--color-input-focus)]
            transition-colors resize-none
          "
        />
      </div>

      {/* Footer row */}
      <div className="flex items-center justify-between pl-12">
        <p
          id="char-count"
          className={`text-[10px] font-mono ${
            isOverLimit
              ? 'text-(--color-danger)]'
              : remaining < 50
              ? 'text-(--color-warning)]'
              : 'text-(--color-text-muted)]'
          }`}
        >
          {remaining} characters remaining
        </p>

        <div className="flex items-center gap-2">
          {submitted && (
            <span className="text-xs text-(--color-success)]">Posted!</span>
          )}
          <Button
            variant="primary"
            size="sm"
            loading={loading}
            disabled={isEmpty || isOverLimit}
            onClick={handleSubmit}
          >
            Post
          </Button>
        </div>
      </div>
    </Card>
  );
}
