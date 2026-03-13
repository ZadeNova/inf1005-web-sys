/**
 * LikeComment.jsx — Lead Island
 * Mounts via: mountIsland('like-comment-root', LikeComment)
 * PHP view: backend/src/Views/community.php
 * Page entry: src/pages/community.jsx
 *
 * Standalone like + comment count widget.
 * Used when you need to embed interactions outside of PostFeed
 * (e.g. on a blog post detail page).
 *
 * data-props: { postId, initialLikes, initialLiked, initialCommentCount }
 *
 * API endpoints (when USE_MOCK = false):
 *   POST /api/v1/community/posts/:postId/like
 *   GET  /api/v1/community/posts/:postId/comments
 */

import { useState } from 'react';
import { usePost }  from '../../shared/hooks/useApi.js';
import { USE_MOCK } from '../../shared/mockAssets.js';

const HeartIcon = ({ filled }) => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={2} aria-hidden="true">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
  </svg>
);

const CommentIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
  </svg>
);

/**
 * @param {string}  postId
 * @param {number}  initialLikes
 * @param {boolean} initialLiked
 * @param {number}  initialCommentCount
 * @param {function} onCommentClick  - callback to open comment panel
 */
export default function LikeComment({
  postId            = 'post-001',
  initialLikes      = 0,
  initialLiked      = false,
  initialCommentCount = 0,
  onCommentClick,
}) {
  const [liked,     setLiked]     = useState(initialLiked);
  const [likeCount, setLikeCount] = useState(initialLikes);

  const { execute: toggleLike, loading } = usePost(
    `/api/v1/community/posts/${postId}/like`
  );

  async function handleLike() {
    // Optimistic update
    const wasLiked = liked;
    setLiked(!wasLiked);
    setLikeCount(prev => wasLiked ? prev - 1 : prev + 1);

    if (USE_MOCK) return;

    try {
      await toggleLike();
    } catch {
      // Rollback on failure
      setLiked(wasLiked);
      setLikeCount(prev => wasLiked ? prev + 1 : prev - 1);
    }
  }

  return (
    <div className="flex items-center gap-4">
      <button
        type="button"
        onClick={handleLike}
        disabled={loading}
        aria-pressed={liked}
        aria-label={liked ? 'Unlike' : 'Like'}
        className={`
          flex items-center gap-1.5 text-xs font-medium
          transition-colors duration-150 disabled:opacity-50
          ${liked
            ? 'text-(--color-danger)'
            : 'text-(--color-text-muted) hover:text-(--color-danger)'
          }
        `}
      >
        <HeartIcon filled={liked} />
        <span>{likeCount}</span>
      </button>

      <button
        type="button"
        onClick={onCommentClick}
        aria-label={`${initialCommentCount} comments`}
        className="flex items-center gap-1.5 text-xs font-medium text-(--color-text-muted) hover:text-(--color-text-primary) transition-colors"
      >
        <CommentIcon />
        <span>{initialCommentCount}</span>
      </button>
    </div>
  );
}
