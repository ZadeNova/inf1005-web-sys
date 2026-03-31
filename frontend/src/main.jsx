/**
 * main.jsx — Vapour FT Island Registry
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * HOW THIS WORKS:
 *   1. PHP views render <div id="some-island-root" data-props='{"key":"val"}'></div>
 *   2. This file calls mountIsland(id, Component) which attaches React to that div.
 *   3. Props are passed via JSON in the data-props attribute.
 *
 * FOR DEVELOPERS (Dev 1 / Dev 2):
 *   - You dont edit this file.
 *   - Build your island in src/islands/Minal/ or src/islands/WH/.
 *   - When your island is ready, tell me (CL). I will register it here.
 *
 * REGISTERING A NEW ISLAND (CL only):
 *   1. Import the component in the correct section below.
 *   2. Add a mountIsland() call with the matching DOM id.
 *   3. Ensure the PHP view has the matching <div id="..."> tag.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

// Global styles — must be imported here so Vite includes them in the build
import "./index.css";

/**
 * Mounts a React island into a DOM element by id.
 * Reads initial props from data-props JSON attribute.
 * Safe to call even if the element doesn't exist on the current page.
 */
function mountIsland(id, Component) {
	const el = document.getElementById(id);
	if (!el) return; // island not present on this page — skip silently

	let props = {};
	try {
		props = JSON.parse(el.dataset.props || "{}");
	} catch (e) {
		console.error(`[mountIsland] Invalid JSON in data-props for #${id}`, e);
	}

	createRoot(el).render(
		<StrictMode>
			<Component {...props} />
		</StrictMode>,
	);
}

/* ═══════════════════════════════════════════════════════════════
   CL ISLANDS
   ═══════════════════════════════════════════════════════════════ */
import ThemeToggle from "./islands/CL/ThemeToggle.jsx";
import PriceChart from "./islands/CL/PriceChart.jsx";
import CreateNewsPost from "./islands/CL/CreateNewsPost.jsx";
import AdminListingsManager from "./islands/CL/AdminListingsManager.jsx";
import AdminBlogManager from "./islands/CL/AdminBlogManager.jsx";
import NavWallet from "./islands/CL/NavWallet.jsx";
mountIsland("theme-toggle-root", ThemeToggle);
mountIsland("price-chart-root", PriceChart);
mountIsland("create-news-post-root", CreateNewsPost);
mountIsland("admin-listings-manager-root", AdminListingsManager);
mountIsland("admin-blog-manager-root", AdminBlogManager);
mountIsland("nav-wallet-root", NavWallet);
/* ═══════════════════════════════════════════════════════════════
   Minal ISLANDS — Login · Register · Blog
   ═══════════════════════════════════════════════════════════════ */
import LoginForm from "./islands/Minal/LoginForm.jsx";
import RegisterForm from "./islands/Minal/RegisterForm.jsx";
import BlogFeed from "./islands/Minal/BlogFeed.jsx";
mountIsland("login-form-root", LoginForm);
mountIsland("register-form-root", RegisterForm);
mountIsland("blog-feed-root", BlogFeed);

/* ═══════════════════════════════════════════════════════════════
   WH ISLANDS — Dashboard · Profile · Listings
   ═══════════════════════════════════════════════════════════════ */
import ListingsGrid from "./islands/WH/ListingsGrid.jsx";
import ProfileCard from "./islands/WH/ProfileCard.jsx";
import PortfolioChart from "./islands/WH/PortfolioChart.jsx";
import ActivityFeed from "./islands/WH/ActivityFeed.jsx";
import RarityDonutChart from "./islands/WH/RarityDonutChart.jsx";
import ActiveListingsManager from "./islands/WH/ActiveListingsManager.jsx";
import ProfileCollections from "./islands/WH/ProfileCollections.jsx";
import WalletBalance from "./islands/WH/WalletBalance.jsx";
import PortfolioTable from "./islands/WH/PortfolioTable.jsx";
import TransactionHistory from "./islands/WH/TransactionHistory.jsx";
import ListingDetail from "./islands/WH/ListingDetail.jsx";
import ListingPriceChart from "./islands/WH/ListingPriceChart.jsx";

mountIsland("listing-detail-root", ListingDetail);
mountIsland("listing-price-chart-root", ListingPriceChart);
mountIsland("listings-grid-root", ListingsGrid);
mountIsland("profile-card-root", ProfileCard);
mountIsland("portfolio-chart-root", PortfolioChart);
mountIsland("activity-feed-root", ActivityFeed);
mountIsland("rarity-donut-chart-root", RarityDonutChart);
mountIsland("active-listings-manager-root", ActiveListingsManager);
mountIsland("profile-collections-root", ProfileCollections);
mountIsland("wallet-balance-root", WalletBalance);
mountIsland("portfolio-table-root", PortfolioTable);
mountIsland("transaction-history-root", TransactionHistory);
