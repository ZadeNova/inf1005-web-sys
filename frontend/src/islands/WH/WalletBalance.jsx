/**
 * WalletBalance.jsx — Dev 2 Island
 * Owner: WH (Dev 2)
 * Mounts via: mountIsland('wallet-balance-root', WalletBalance)
 * PHP view: backend/src/Views/dashboard.php → <div id="wallet-balance-root">
 *
 * Displays:
 *   - Current balance (with show/hide toggle)
 *   - Last 5 ledger entries (type, amount, reason, running balance)
 *   GET /api/v1/user/wallet
 *   Returns: { wallet: { balance, ledger: [{ type, amount, reason,
 *              balance_after, created_at }] } }
 */

import { useState } from "react";
import Card from "../../shared/atoms/Card.jsx";
import Skeleton from "../../shared/atoms/Skeleton.jsx";
import { useApi } from "../../shared/hooks/useApi.js";
import { useEffect, useCallback } from "react";

/* ── Icons ─────────────────────────────────────────────────────────────── */
const EyeIcon = () => (
	<svg
		viewBox="0 0 24 24"
		fill="none"
		stroke="currentColor"
		strokeWidth={2}
		className="w-4 h-4"
		aria-hidden="true"
	>
		<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
		<circle cx="12" cy="12" r="3" />
	</svg>
);
const EyeOffIcon = () => (
	<svg
		viewBox="0 0 24 24"
		fill="none"
		stroke="currentColor"
		strokeWidth={2}
		className="w-4 h-4"
		aria-hidden="true"
	>
		<path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
		<path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
		<line x1="1" y1="1" x2="23" y2="23" />
	</svg>
);
const WalletIcon = () => (
	<svg
		viewBox="0 0 24 24"
		fill="none"
		stroke="currentColor"
		strokeWidth={2}
		className="w-4 h-4"
		aria-hidden="true"
	>
		<rect x="2" y="5" width="20" height="14" rx="2" />
		<path d="M16 12h2" />
		<path d="M2 10h20" />
	</svg>
);

/* ── Helpers ────────────────────────────────────────────────────────────── */
function formatReason(reason) {
	if (!reason) return "—";
	return reason
		.replace(/^(purchase|sale|credit|debit):/, "")
		.replace(/_/g, " ")
		.replace(/\b\w/g, (c) => c.toUpperCase());
}

function timeAgo(isoString) {
	const diff = Date.now() - new Date(isoString).getTime();
	const mins = Math.floor(diff / 60000);
	if (mins < 60) return `${mins}m ago`;
	const hrs = Math.floor(mins / 60);
	if (hrs < 24) return `${hrs}h ago`;
	return `${Math.floor(hrs / 24)}d ago`;
}

/* ════════════════════════════════════════════════════════════════════════
   MAIN EXPORT
   ════════════════════════════════════════════════════════════════════════ */
export default function WalletBalance() {
	const [showBalance, setShowBalance] = useState(true);

	// REPLACE the useApi call with manual polling:
	const [data, setData] = useState(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);

	const fetchBalance = useCallback(async () => {
		try {
			const res = await fetch("/api/v1/user/wallet", {
				credentials: "same-origin",
			});
			if (!res.ok) throw new Error(`HTTP ${res.status}`);
			const json = await res.json();
			setData(json);
			setError(null);
		} catch (err) {
			setError(err.message);
		} finally {
			setLoading(false);
		}
	}, []);

	useEffect(() => {
		fetchBalance();
		const interval = setInterval(fetchBalance, 10000); // poll every 10s
		return () => clearInterval(interval);
	}, [fetchBalance]);

	const wallet = (data?.wallet ?? null);
	const balance = wallet?.balance ?? 0;
	const currency = wallet?.currency ?? "VPR";
	const ledger = (wallet?.ledger ?? []).slice(0, 5);

	const masked = "$" + balance.toFixed(2).replace(/[0-9]/g, "•");

	/* ── Loading ─────────────────────────────────────────────────────── */
	if (loading) {
		return (
			<Card variant="default" padding="md" className="flex flex-col gap-4">
				<Skeleton
					variant="block"
					height={20}
					width="40%"
					label="Loading wallet"
				/>
				<Skeleton variant="block" height={36} width="60%" />
				<div className="flex flex-col gap-2">
					{[1, 2, 3].map((i) => (
						<Skeleton
							key={i}
							variant="block"
							height={16}
							label="Loading ledger entry"
						/>
					))}
				</div>
			</Card>
		);
	}

	/* ── Error ───────────────────────────────────────────────────────── */
	if (error) {
		return (
			<Card variant="default" padding="md">
				<p role="alert" className="text-sm text-(--color-danger)">
					Failed to load wallet: {error}
				</p>
			</Card>
		);
	}

	/* ── Render ──────────────────────────────────────────────────────── */
	return (
		<Card variant="default" padding="md" className="flex flex-col gap-4">
			{/* ── Balance header ─────────────────────────────────────── */}
			<div className="flex items-center gap-2">
				<WalletIcon />
				<h3
					className="text-[10px] font-semibold uppercase tracking-widest
                       text-(--color-text-muted) flex-1"
				>
					Wallet Balance
				</h3>
				<button
					type="button"
					onClick={() => setShowBalance((v) => !v)}
					aria-label={showBalance ? "Hide balance" : "Show balance"}
					className="text-(--color-text-muted) hover:text-(--color-accent)
                           transition-colors"
				>
					{showBalance ? <EyeIcon /> : <EyeOffIcon />}
				</button>
			</div>

			<div>
				<p
					className="text-2xl font-bold text-(--color-accent) tabular-nums"
					aria-live="polite"
				>
					{showBalance
						? `$${balance.toLocaleString("en-US", { minimumFractionDigits: 2 })}`
						: masked}
					<span className="text-xs font-normal text-(--color-text-muted) ml-1">
						{currency}
					</span>
				</p>
			</div>

			{/* ── Ledger entries ─────────────────────────────────────── */}
			{ledger.length > 0 && (
				<div className="flex flex-col gap-0 border-t border-(--color-border) pt-3">
					<p
						className="text-[10px] font-semibold uppercase tracking-widest
                        text-(--color-text-muted) mb-2"
					>
						Recent transactions
					</p>
					<ul className="flex flex-col gap-0">
						{ledger.map((entry, idx) => (
							<li
								key={entry.id ?? idx}
								className={`flex items-center gap-2 py-2 text-xs
                    ${idx < ledger.length - 1 ? "border-b border-(--color-border)" : ""}`}
							>
								{/* Type badge */}
								<span
									className={`shrink-0 font-bold px-1.5 py-0.5 rounded text-[10px]
                  ${
										entry.type === "credit"
											? "bg-(--color-success-subtle) text-(--color-success)"
											: "bg-(--color-danger-subtle)  text-(--color-danger)"
									}`}
								>
									{entry.type === "credit" ? "+" : "−"}
								</span>

								{/* Reason */}
								<span className="flex-1 text-(--color-text-secondary) truncate">
									{formatReason(entry.reason)}
								</span>

								{/* Amount */}
								<span
									className={`font-semibold tabular-nums shrink-0
                  ${
										entry.type === "credit"
											? "text-(--color-success)"
											: "text-(--color-danger)"
									}`}
								>
									{entry.type === "credit" ? "+" : "−"}$
									{Number(entry.amount).toLocaleString("en-US", {
										minimumFractionDigits: 2,
									})}
								</span>

								{/* Time */}
								<span className="text-(--color-text-muted) shrink-0 hidden sm:block">
									{timeAgo(entry.created_at)}
								</span>
							</li>
						))}
					</ul>
				</div>
			)}
		</Card>
	);
}
