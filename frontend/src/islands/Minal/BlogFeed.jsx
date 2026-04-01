/**
 * BlogFeed.jsx — Dev 1 Island
 * Owner: Dev 1
 * Mounts via: mountIsland('blog-feed-root', BlogFeed)
 * PHP view: backend/src/Views/blog.php → <div id="blog-feed-root" data-props="{}"></div>
 *
 *   GET /api/v1/blog/posts
 *   Returns: { posts: [{ id, title, excerpt, author, publishedAt, category, imageUrl }] }
 */

import { useState } from "react";
import Card from "../../shared/atoms/Card.jsx";
import Badge from "../../shared/atoms/Badge.jsx";
import Skeleton from "../../shared/atoms/Skeleton.jsx";
import { useApi } from "../../shared/hooks/useApi.js";
import Button from "../../shared/atoms/Button.jsx";


function BlogPostCard({ post }) {
	return (
		<Card variant="default" padding="md" glow as="article"
      		className="hover:border-(--color-accent) transition-colors">
 		 <a href={`/blog/${post.id}`} className="flex flex-col gap-3 group">
			<a href={`/blog/${post.id}`} className="flex flex-col gap-3 group">
				<div className="flex items-center justify-between">
					<Badge label={post.category} colour="accent" size="sm" />
					<time
						className="text-xs text-(--color-text-muted)"
						dateTime={post.publishedAt}
					>
						{new Date(post.publishedAt).toLocaleDateString("en-US", {
							year: "numeric",
							month: "short",
							day: "numeric",
						})}
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
			</a>
		</Card>
	);
}

export default function BlogFeed() {
	// useState stores which category the user has selected.
	// 'All' means show everything. When user clicks a filter button,
	// this updates and the list re-renders automatically.
	const [activeCategory, setActiveCategory] = useState("All");

	const { data, loading, error } = useApi("/api/v1/blog/posts");

	const allPosts = (data?.posts ?? []);

	const categories = ["All", ...new Set(allPosts.map((p) => p.category))];

	const filteredPosts =
		activeCategory === "All"
			? allPosts
			: allPosts.filter((p) => p.category === activeCategory);

	if (loading) {
		return (
			<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
				{Array.from({ length: 6 }).map((_, i) => (
					<Skeleton key={i} variant="card" />
				))}
			</div>
		);
	}

	if (error) {
		return (
			<p role="alert" className="text-(--color-danger) text-sm">
				Failed to load posts. Please try again later.
			</p>
		);
	}

	return (
		<section aria-labelledby="blog-feed-heading">
			<h2 id="blog-feed-heading" className="sr-only">
				Blog Posts
			</h2>

			<div
				className="flex flex-wrap gap-2 mb-6"
				role="group"
				aria-label="Filter by category"
			>
				{categories.map((cat) => (
					<Button
						key={cat}
						variant={activeCategory === cat ? "primary" : "ghost"}
						size="sm"
						onClick={() => setActiveCategory(cat)}
						aria-label={`Filter by ${cat}`}
					>
						{cat}
					</Button>
				))}
			</div>

			<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
				{filteredPosts.map((post) => (
					<BlogPostCard key={post.id} post={post} />
				))}
			</div>

			{filteredPosts.length === 0 && (
				<p className="text-(--color-text-muted) text-sm mt-4">
					No posts in this category yet.
				</p>
			)}
		</section>
	);
}
