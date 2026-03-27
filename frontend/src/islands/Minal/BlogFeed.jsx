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

import { useState } from "react";
import Card from "../../shared/atoms/Card.jsx";
import Badge from "../../shared/atoms/Badge.jsx";
import Skeleton from "../../shared/atoms/Skeleton.jsx";
import { useApi } from "../../shared/hooks/useApi.js";
import { USE_MOCK } from "../../shared/mockAssets.js";
import Button from "../../shared/atoms/Button.jsx";

/* Mock blog posts — local to this island, not in mockAssets.js */
const MOCK_POSTS = [
	{
		id: "blog-001",
		title: "Shadowfall Collection: Everything You Need to Know",
		excerpt:
			"A breakdown of the rarity distribution, price floors, and top performers from the latest Shadowfall drop.",
		author: "0xVault",
		publishedAt: "2025-03-10",
		category: "Collection Guide",
		imageUrl: null,
	},
	{
		id: "blog-002",
		title: "How P2P Trading Works on Vapour FT",
		excerpt:
			"Atomic transactions explained — from making an offer to acceptance and settlement.",
		author: "ShadowHawk",
		publishedAt: "2025-03-08",
		category: "Tutorial",
		imageUrl: null,
	},
	{
		id: "blog-003",
		title: "Colorblind Accessibility in NFT Marketplaces",
		excerpt:
			"Why colour alone is never enough — how Vapour FT uses symbols alongside colour for rarity indicators.",
		author: "VaultKeeper",
		publishedAt: "2025-03-06",
		category: "Accessibility",
		imageUrl: null,
	},
	{
		id: "blog-004",
		title: "Celestial Series Drop: Secret Rare Odds Revealed",
		excerpt:
			"The Celestial Series introduces three new Secret Rare pieces. We break down pull rates and estimated floor prices.",
		author: "DropWatch",
		publishedAt: "2025-03-14",
		category: "Drop Announcement",
		imageUrl: null,
	},
	{
		id: "blog-005",
		title: "Beginner's Guide: Understanding Rarity Tiers on Vapour FT",
		excerpt:
			"Common, Uncommon, Rare, Ultra Rare, Secret Rare — what do they actually mean for value and trading strategy?",
		author: "0xVault",
		publishedAt: "2025-03-12",
		category: "Tutorial",
		imageUrl: null,
	},
	{
		id: "blog-006",
		title: "Core Drop 2024: Six Months Later — Where Are Prices Now?",
		excerpt:
			"We revisit the inaugural Core Drop and track how asset prices have moved since launch. Some surprises inside.",
		author: "VaultKeeper",
		publishedAt: "2025-03-01",
		category: "Market Update",
		imageUrl: null,
	},
	{
		id: "blog-007",
		title: "Artist Spotlight: The Generative Art Behind Shadowfall",
		excerpt:
			"An interview with the generative art process — how algorithms and hand-drawn elements combine to create unique pieces.",
		author: "ShadowHawk",
		publishedAt: "2025-02-25",
		category: "Artist Spotlight",
		imageUrl: null,
	},
	{
		id: "blog-008",
		title: "Promo Cards Explained: Tournament Exclusives and How to Get Them",
		excerpt:
			"Promo and Tournament Exclusive assets have different rarity rules. Here's how the system works.",
		author: "DropWatch",
		publishedAt: "2025-02-20",
		category: "Collection Guide",
		imageUrl: null,
	},
];

function BlogPostCard({ post }) {
	return (
		<Card variant="default" padding="md" glow as="article">
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
		</Card>
	);
}

export default function BlogFeed() {
	// useState stores which category the user has selected.
	// 'All' means show everything. When user clicks a filter button,
	// this updates and the list re-renders automatically.
	const [activeCategory, setActiveCategory] = useState("All");

	const { data, loading, error } = useApi(
		USE_MOCK ? null : "/api/v1/blog/posts",
		{ auto: !USE_MOCK },
	);

	const allPosts = USE_MOCK ? MOCK_POSTS : (data?.posts ?? []);

	// Build the list of unique category names from all posts
	const categories = ["All", ...new Set(allPosts.map((p) => p.category))];

	// Filter: if 'All' is selected, show every post. Otherwise only matching ones.
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

			{/* Category filter buttons */}
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

			{/* Card grid — 3 columns on large screens */}
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
