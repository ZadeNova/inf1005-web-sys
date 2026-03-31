/**
 * ThemeToggle.jsx — Vapour FT Island (Lead)
 * Mounts via: mountIsland('theme-toggle-root', ThemeToggle)
 *
 * Renders the three-mode toggle button group shown in the nav.
 * Uses useTheme() to read/write the data-theme attribute on <html>.
 */
import React from "react";
import { useTheme } from "../../shared/hooks/useTheme.js";

const THEME_OPTIONS = [
	{
		key: "dark",
		label: "Dark",
		icon: (
			<svg
				className="w-3.5 h-3.5"
				viewBox="0 0 24 24"
				fill="currentColor"
				aria-hidden="true"
			>
				<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
			</svg>
		),
	},
	{
		key: "light",
		label: "Light",
		icon: (
			<svg
				className="w-3.5 h-3.5"
				viewBox="0 0 24 24"
				fill="currentColor"
				aria-hidden="true"
			>
				<circle cx="12" cy="12" r="5" />
				<path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
			</svg>
		),
	},
	{
		key: "colorblind",
		label: "Colorblind",
		icon: (
			<svg
				className="w-3.5 h-3.5"
				viewBox="0 0 24 24"
				fill="currentColor"
				aria-hidden="true"
			>
				<path d="M12 5C7 5 2.73 8.11 1 12.5 2.73 16.89 7 20 12 20s9.27-3.11 11-7.5C21.27 8.11 17 5 12 5zm0 12a4.5 4.5 0 1 1 0-9 4.5 4.5 0 0 1 0 9zm0-7a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5z" />
			</svg>
		),
	},
];

export default function ThemeToggle() {
	const { theme, setTheme } = useTheme();

	return (
		<div
			role="group"
			aria-label="Select colour theme"
			className="
        flex items-center
        bg-(--color-surface-2)
        border border-(--color-border)
        rounded-full
        p-0.5
        gap-0.5
      "
		>
			{THEME_OPTIONS.map(({ key, label, icon }) => {
				const isActive = theme === key;
				return (
					<button
						key={key}
						type="button"
						onClick={() => setTheme(key)}
						aria-pressed={isActive}
						aria-label={`${label} mode`}
						className={`
              inline-flex items-center justify-center md:gap-1.5
              p-1.5 md:px-3 md:py-1.5
              text-xs font-semibold
              rounded-full
              transition-all duration-(--transition-base)
              focus-visible:outline-2 focus-visible:outline-(--color-accent) focus-visible:outline-offset-1
              ${
								isActive
									? "bg-(--color-accent) text-white shadow-sm"
									: "text-(--color-text-secondary) hover:text-(--color-text-primary) hover:bg-(--color-surface-3)"
							}
            `
							.replace(/\s+/g, " ")
							.trim()}
					>
						{icon}
						<span className="hidden md:inline">{label}</span>
					</button>
				);
			})}
		</div>
	);
}
