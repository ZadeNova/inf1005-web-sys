/**
 * Badge.jsx — Vapour FT Atom
 * LEAD ONLY — shared atom, do not modify without Frontend Lead approval.
 *
 * FIX: RarityBadge now uses inline style for dynamic CSS variable lookups.
 * Tailwind cannot resolve dynamic class names like bg-(--color-rarity-${cssKey}-bg)
 * at build time — they must be inline styles.
 */

export const RARITY_CONFIG = {
  COMMON: {
    label:     'Common',
    symbol:    '○',
    ariaSymbol:'Circle',
    cssKey:    'common',
  },
  UNCOMMON: {
    label:     'Uncommon',
    symbol:    '◆',
    ariaSymbol:'Diamond',
    cssKey:    'uncommon',
  },
  RARE: {
    label:     'Rare',
    symbol:    '★',
    ariaSymbol:'Star',
    cssKey:    'rare',
  },
  ULTRA_RARE: {
    label:     'Ultra Rare',
    symbol:    '✦',
    ariaSymbol:'Double-star',
    cssKey:    'ultrarare',
  },
  SECRET_RARE: {
    label:     'Secret Rare',
    symbol:    '♛',
    ariaSymbol:'Crown',
    cssKey:    'secretrare',
  },
};

const CONDITION_CONFIG = {
  'Mint':               { label: 'Mint',               cssVar: 'var(--color-condition-mint)' },
  'Near Mint':          { label: 'Near Mint',           cssVar: 'var(--color-condition-nearmint)' },
  'Lightly Played':     { label: 'Lightly Played',      cssVar: 'var(--color-condition-lightlyplayed)' },
  'Moderately Played':  { label: 'Moderately Played',   cssVar: 'var(--color-condition-moderatelyplayed)' },
  'Heavily Played':     { label: 'Heavily Played',      cssVar: 'var(--color-condition-heavilyplayed)' },
};

/**
 * RarityBadge
 * FIX: dynamic CSS variable names cannot be used as Tailwind utility classes
 * (Tailwind scans source at build time and won't find interpolated strings).
 * Solution: use inline style with var(--color-rarity-*) lookups instead.
 *
 * @param {'COMMON'|'UNCOMMON'|'RARE'|'ULTRA_RARE'|'SECRET_RARE'} tier
 * @param {'sm'|'md'} size
 */
export function RarityBadge({ tier, size = 'md' }) {
  // Normalise DB Title Case or any format → SCREAMING_SNAKE_CASE key
  // Handles: 'Common', 'COMMON', 'Ultra Rare', 'ULTRA_RARE' etc.
  const normalised = tier?.toUpperCase().replace(/\s+/g, '_') ?? 'COMMON';
  const config     = RARITY_CONFIG[normalised] ?? RARITY_CONFIG.COMMON;
  const cssKey     = config.cssKey;

  const sizeClass = size === 'sm'
    ? 'text-[10px] px-1.5 py-0.5 gap-1'
    : 'text-xs px-2.5 py-1 gap-1.5';

  return (
    <span
      role="img"
      aria-label={`Rarity: ${config.label} (${config.ariaSymbol})`}
      className={`inline-flex items-center font-semibold rounded-full border ${sizeClass}`}
      style={{
        // FIX: inline styles resolve CSS variables correctly at runtime
        borderColor:     `var(--color-rarity-${cssKey})`,
        backgroundColor: `var(--color-rarity-${cssKey}-bg)`,
        color:           `var(--color-rarity-${cssKey}-text)`,
      }}
    >
      <span aria-hidden="true" className="leading-none">{config.symbol}</span>
      <span>{config.label}</span>
    </span>
  );
}

/**
 * ConditionBadge
 * @param {'Mint'|'Near Mint'|'Lightly Played'|'Moderately Played'|'Heavily Played'} condition
 * @param {'sm'|'md'} size
 */
export function ConditionBadge({ condition, size = 'md' }) {
  const config = CONDITION_CONFIG[condition] ?? { label: condition, cssVar: 'var(--color-text-muted)' };

  const sizeClass = size === 'sm'
    ? 'text-[10px] px-1.5 py-0.5'
    : 'text-xs px-2.5 py-1';

  return (
    <span
      className={`inline-flex items-center font-medium rounded-full border bg-transparent ${sizeClass}`}
      style={{
        borderColor: config.cssVar,
        color:       config.cssVar,
      }}
    >
      {config.label}
    </span>
  );
}

/* -----------------------------------------------------------
   Generic Badge — for status labels like "Hot", "New", etc.
   @param {'success'|'danger'|'warning'|'accent'|'muted'} colour
   ----------------------------------------------------------- */
const GENERIC_COLOUR_MAP = {
  success: {
    bg:     'var(--color-success-subtle)',
    border: 'var(--color-success)',
    text:   'var(--color-success)',
  },
  danger: {
    bg:     'var(--color-danger-subtle)',
    border: 'var(--color-danger)',
    text:   'var(--color-danger)',
  },
  warning: {
    bg:     'var(--color-warning-subtle)',
    border: 'var(--color-warning)',
    text:   'var(--color-warning)',
  },
  accent: {
    bg:     'var(--color-accent-subtle)',
    border: 'var(--color-accent)',
    text:   'var(--color-accent)',
  },
  muted: {
    bg:     'var(--color-surface-2)',
    border: 'var(--color-border)',
    text:   'var(--color-text-muted)',
  },
};

export default function Badge({ label, colour = 'accent', size = 'md', icon = null }) {
  const colours   = GENERIC_COLOUR_MAP[colour] ?? GENERIC_COLOUR_MAP.muted;
  const sizeClass = size === 'sm'
    ? 'text-[10px] px-1.5 py-0.5 gap-1'
    : 'text-xs px-2.5 py-1 gap-1';

  return (
    <span
      className={`inline-flex items-center font-semibold rounded-full border ${sizeClass}`}
      style={{
        backgroundColor: colours.bg,
        borderColor:     colours.border,
        color:           colours.text,
      }}
    >
      {icon && <span aria-hidden="true" className="leading-none">{icon}</span>}
      {label}
    </span>
  );
}