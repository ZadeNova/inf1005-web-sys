/**
 * BlogFeed.jsx — Dev 1 Island
 * Owner: Dev 1
 * Mounts via: mountIsland('blog-feed-root', BlogFeed)
 * PHP view: backend/src/Views/blog.php → <div id="blog-feed-root" data-props="{}"></div>
 *
 * API endpoint (when USE_MOCK = false):
 *   GET /api/v1/blog/posts
 *   Returns: { posts: [{ id, title, excerpt, author, publishedAt, category, imageUrl }] }
 */

import { useState } from 'react';
import Card     from '../../shared/atoms/Card.jsx';
import Badge    from '../../shared/atoms/Badge.jsx';
import Skeleton from '../../shared/atoms/Skeleton.jsx';
import { useApi }   from '../../shared/hooks/useApi.js';
import { USE_MOCK } from '../../shared/mockAssets.js';

/* Mock blog posts — local to this island, not in mockAssets.js */
const MOCK_POSTS = [
  { id: 'blog-001', title: 'Shadowfall Collection: Everything You Need to Know', excerpt: 'A breakdown of the rarity distribution, price floors, and top performers from the latest Shadowfall drop.', author: '0xVault', publishedAt: '2025-03-10', category: 'Collection Guide', imageUrl: null },
  { id: 'blog-002', title: 'How P2P Trading Works on Vapour FT', excerpt: 'Atomic transactions explained — from making an offer to acceptance and settlement.', author: 'ShadowHawk', publishedAt: '2025-03-08', category: 'Tutorial', imageUrl: null },
  { id: 'blog-003', title: 'Colorblind Accessibility in NFT Marketplaces', excerpt: 'Why colour alone is never enough — how Vapour FT uses symbols alongside colour for rarity indicators.', author: 'VaultKeeper', publishedAt: '2025-03-06', category: 'Accessibility', imageUrl: null },
];

function BlogPostCard({ post }) {
  return (
    <Card variant="default" padding="md" glow as="article">
      <a href={`/blog/${post.id}`} className="flex flex-col gap-3 group">
        <div className="flex items-center justify-between">
          <Badge label={post.category} colour="accent" size="sm" />
          <time className="text-xs text-(--color-text-muted)" dateTime={post.publishedAt}>
            {new Date(post.publishedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
          </time>
        </div>
        <h2 className="text-base font-bold text-(--color-text-primary) group-hover:text-(--color-accent) transition-colors leading-snug">
          {post.title}
        </h2>
        <p className="text-sm text-(--color-text-secondary) line-clamp-3">
          {post.excerpt}
        </p>
        <p className="text-xs text-(--color-text-muted)">By {post.author}</p>
      </a>
    </Card>
  );
}

export default function BlogFeed() {
  // TODO Dev 1: add category filter state here
  const { data, loading, error } = useApi(
    USE_MOCK ? null : '/api/v1/blog/posts',
    { auto: !USE_MOCK }
  );

  const posts = USE_MOCK ? MOCK_POSTS : (data?.posts ?? []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" role="status" aria-label="Loading blog posts">
        {Array.from({ length: 3 }, (_, i) => (
          <Skeleton key={i} variant="card" label="Loading blog post" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <p role="alert" className="text-(--color-danger) text-sm">
        Failed to load posts: {error}
      </p>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {posts.map(post => (
        <BlogPostCard key={post.id} post={post} />
      ))}
    </div>
  );
}
