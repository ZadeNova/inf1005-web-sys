import { useState, useEffect, useCallback } from "react";

export default function NavWallet({ isAdmin = false }) {
    const [balance, setBalance] = useState(null);
	if (isAdmin) return null;
	
	const fetchBalance = useCallback(async () => {
		try {
			const res = await fetch("/api/v1/user/wallet", {
				credentials: "same-origin",
			});
			if (!res.ok) return;
			const json = await res.json();
			setBalance(json?.wallet?.balance ?? null);
		} catch (e) {
		}
	}, []);

	useEffect(() => {
		void fetchBalance();
		const interval = setInterval(() => {
			void fetchBalance();
		}, 10000);
		return () => clearInterval(interval);
	}, [fetchBalance]);

	if (balance === null) return null;

	return (
		<a
			href="/dashboard"
			aria-label={`Wallet balance: $${Number(balance).toLocaleString("en-US", { minimumFractionDigits: 2 })} VPR`}
			className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5
                  rounded-full text-xs font-bold tabular-nums
                  bg-(--color-accent-subtle) border border-(--color-accent)
                  text-(--color-accent) hover:bg-(--color-accent)
                  hover:text-white transition-colors"
		>
			<svg
				className="w-3 h-3 shrink-0"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				strokeWidth={2}
				aria-hidden="true"
			>
				<rect x="2" y="5" width="20" height="14" rx="2" />
				<path d="M16 12h2" />
				<path d="M2 10h20" />
			</svg>
			${Number(balance).toLocaleString("en-US", { minimumFractionDigits: 2 })}
			<span className="font-normal text-(--color-accent) opacity-90">VPR</span>
		</a>
	);
}
