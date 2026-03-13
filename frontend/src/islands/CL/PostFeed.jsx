/**
 * PostFeed.jsx — Lead Island
 * Mounts via: mountIsland('post-feed-root', PostFeed)
 * PHP view: backend/src/Views/community.php
 * Page entry: src/pages/community.jsx
 *
 * Renders the community post feed with inline like and comment support.
 * Pulls in LikeComment island per post for interactions.
 *
 * API endpoint (when USE_MOCK = false):
 *   GET /api/v1/community/posts?page=1
 *   Returns: { posts: [...], pagination: { page, total, perPage } }
 */

import { useState }  from 'react';
import Card          from '../../shared/atoms/Card.jsx';
import Button        from '../../shared/atoms/Button.jsx';
import Skeleton      from '../../shared/atoms/Skeleton.jsx';
import { useApi }    from '../../shared/hooks/useApi.js';
import { mockPosts, mockUsers, USE_MOCK } from '../../shared/mockAssets.js';

/* Heart icon */
const HeartIcon = ({ filled }) => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={2} aria-hidden="true">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
  </svg>
);

/* Comment icon */
const CommentIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
  </svg>
);

function TimeAgo({ isoString }) {
  const diff = Math.floor((Date.now() - new Date(isoString)) / 1000);
  if (diff < 60)   return <span>{diff}s ago</span>;
  if (diff < 3600) return <span>{Math.floor(diff / 60)}m ago</span>;
  if (diff < 86400) return <span>{Math.floor(diff / 3600)}h ago</span>;
  return <span>{Math.floor(diff / 86400)}d ago</span>;
}

function PostCard({ post }) {
  const [liked,      setLiked]      = useState(post.liked);
  const [likeCount,  setLikeCount]  = useState(post.likes);
  const [showComments, setShowComments] = useState(false);
  const [commentText,  setCommentText]  = useState('');
  const [comments,     setComments]     = useState(post.comments ?? []);

  function handleLike() {
    setLiked(prev => !prev);
    setLikeCount(prev => liked ? prev - 1 : prev + 1);
    // TODO Lead: POST /api/v1/community/posts/:id/like when USE_MOCK = false
  }

  function handleComment() {
    if (!commentText.trim()) return;
    const newComment = {
      id:        `comment-local-${Date.now()}`,
      author:    mockUsers[0], // TODO: replace with current user from data-props
      content:   commentText,
      createdAt: new Date().toISOString(),
    };
    setComments(prev => [...prev, newComment]);
    setCommentText('');
    // TODO Lead: POST /api/v1/community/posts/:id/comments when USE_MOCK = false
  }

  return (
    <Card variant="default" padding="md" className="flex flex-col gap-4">
      {/* Author row */}
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-full bg-(--color-accent-subtle)] border border-(--color-accent)] flex items-center justify-center shrink-0">
          <span className="text-xs font-bold text-(--color-accent)]">
            {post.author.username[0].toUpperCase()}
          </span>
        </div>
        <div>
          <p className="text-sm font-semibold text-(--color-text-primary)]">
            {post.author.username}
          </p>
          <p className="text-[10px] text-(--color-text-muted)]">
            <TimeAgo isoString={post.createdAt} />
          </p>
        </div>
      </div>

      {/* Content */}
      <p className="text-sm text-(--color-text-secondary)] leading-relaxed">
        {post.content}
      </p>

      {/* Actions row */}
      <div className="flex items-center gap-4 pt-1 border-t border-(--color-border)]">
        <button
          type="button"
          onClick={handleLike}
          aria-pressed={liked}
          aria-label={liked ? 'Unlike post' : 'Like post'}
          className={`
            flex items-center gap-1.5 text-xs font-medium
            transition-colors duration-150
            ${liked
              ? 'text-(--color-danger)]'
              : 'text-(--color-text-muted)] hover:text-(--color-danger)]'
            }
          `}
        >
          <HeartIcon filled={liked} />
          {likeCount}
        </button>

        <button
          type="button"
          onClick={() => setShowComments(prev => !prev)}
          aria-expanded={showComments}
          className="flex items-center gap-1.5 text-xs font-medium text-(--color-text-muted)] hover:text-(--color-text-primary)] transition-colors"
        >
          <CommentIcon />
          {comments.length} {comments.length === 1 ? 'comment' : 'comments'}
        </button>
      </div>

      {/* Comments section */}
      {showComments && (
        <div className="flex flex-col gap-3">
          {comments.length > 0 && (
            <div className="flex flex-col gap-2 pl-3 border-l-2 border-(--color-border)]">
              {comments.map(c => (
                <div key={c.id} className="flex flex-col gap-0.5">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-(--color-text-primary)]">
                      {c.author.username}
                    </span>
                    <span className="text-[10px] text-(--color-text-muted)]">
                      <TimeAgo isoString={c.createdAt} />
                    </span>
                  </div>
                  <p className="text-xs text-(--color-text-secondary)]">{c.content}</p>
                </div>
              ))}
            </div>
          )}

          {/* Comment composer */}
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Write a comment..."
              value={commentText}
              onChange={e => setCommentText(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleComment()}
              aria-label="Write a comment"
              className="
                flex-1 px-3 py-2 text-xs rounded-md]
                bg-(--color-input-bg)]
                border border-(--color-input-border)]
                text-(--color-text-primary)]
                placeholder:text-(--color-input-placeholder)]
                focus:outline-none focus:border-(--color-input-focus)]
                transition-colors
              "
            />
            <Button variant="primary" size="sm" onClick={handleComment}>
              Post
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
}

export default function PostFeed() {
  const { data, loading, error } = useApi(
    USE_MOCK ? null : '/api/v1/community/posts',
    { auto: !USE_MOCK }
  );

  const posts = USE_MOCK ? mockPosts : (data?.posts ?? []);

  if (loading) {
    return (
      <div className="flex flex-col gap-4" role="status" aria-label="Loading posts">
        {Array.from({ length: 3 }, (_, i) => (
          <Skeleton key={i} variant="card" label="Loading post" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <p role="alert" className="text-sm text-(--color-danger)]">
        Failed to load posts: {error}
      </p>
    );
  }

  if (posts.length === 0) {
    return (
      <Card variant="inset" padding="lg" className="text-center">
        <p className="text-sm text-(--color-text-muted)]">
          No posts yet. Be the first to post!
        </p>
      </Card>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {posts.map(post => (
        <PostCard key={post.id} post={post} />
      ))}
    </div>
  );
}
