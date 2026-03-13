/**
 * Badge.jsx — Vapour FT Atom
 * LEAD ONLY — shared atom, do not modify without Frontend Lead approval.
 *
 * Handles two badge types:
 *   1. RarityBadge — renders rarity tier with colour + symbol (WCAG: colour never sole indicator)
 *   2. ConditionBadge — renders asset condition
 *   3. Badge (generic) — for arbitrary labels
 *
 * Usage:
 *   <RarityBadge tier="ULTRA_RARE" />
 *   <ConditionBadge condition="Mint" />
 *   <Badge label="Hot" colour="success" />
 *
 * Symbol rendering ensures colorblind users always have a non-colour indicator.
 * Symbols change between themes (dark/light use icon glyphs; colorblind adds aria-label).
 */

/* -----------------------------------------------------------
   RARITY CONFIG
   Each tier has: label, symbol glyph, CSS variable suffix
   The symbol is rendered visually AND in aria-label.
   ----------------------------------------------------------- */
export const RARITY_CONFIG = {
  COMMON: {
    label:     'Common',
    symbol:    '○',        // Circle
    ariaSymbol:'Circle',
    cssKey:    'common',
  },
  UNCOMMON: {
    label:     'Uncommon',
    symbol:    '◆',        // Diamond
    ariaSymbol:'Diamond',
    cssKey:    'uncommon',
  },
  RARE: {
    label:     'Rare',
    symbol:    '★',        // Star
    ariaSymbol:'Star',
    cssKey:    'rare',
  },
  ULTRA_RARE: {
    label:     'Ultra Rare',
    symbol:    '✦',        // Double-star / sparkle
    ariaSymbol:'Double-star',
    cssKey:    'ultrarare',
  },
  SECRET_RARE: {
    label:     'Secret Rare',
    symbol:    '♛',        // Crown
    ariaSymbol:'Crown',
    cssKey:    'secretrare',
  },
};

/* -----------------------------------------------------------
   CONDITION CONFIG
   ----------------------------------------------------------- */
const CONDITION_CONFIG = {
  'Mint':               { label: 'Mint',               cssVar: 'var(--color-condition-mint)' },
  'Near Mint':          { label: 'Near Mint',           cssVar: 'var(--color-condition-nearmint)' },
  'Lightly Played':     { label: 'Lightly Played',      cssVar: 'var(--color-condition-lightlyplayed)' },
  'Moderately Played':  { label: 'Moderately Played',   cssVar: 'var(--color-condition-moderatelyplayed)' },
  'Heavily Played':     { label: 'Heavily Played',      cssVar: 'var(--color-condition-heavilyplayed)' },
};

/* -----------------------------------------------------------
   RarityBadge
   @param {'COMMON'|'UNCOMMON'|'RARE'|'ULTRA_RARE'|'SECRET_RARE'} tier
   @param {'sm'|'md'} size
   ----------------------------------------------------------- */
export function RarityBadge({ tier, size = 'md' }) {
  const config = RARITY_CONFIG[tier] ?? RARITY_CONFIG.COMMON;
  const cssKey = config.cssKey;

  const sizeClass = size === 'sm'
    ? 'text-[10px] px-1.5 py-0.5 gap-1'
    : 'text-xs px-2.5 py-1 gap-1.5';

  return (
    <span
      role="img"
      aria-label={`Rarity: ${config.label} (${config.ariaSymbol})`}
      className={`
        inline-flex items-center font-semibold rounded-full
        border border-(--color-rarity-${cssKey})]
        bg-(--color-rarity-${cssKey}-bg)]
        text-(--color-rarity-${cssKey}-text)]
        ${sizeClass}
      `.replace(/\s+/g, ' ').trim()}
    >
      <span aria-hidden="true" className="leading-none">{config.symbol}</span>
      <span>{config.label}</span>
    </span>
  );
}

/* -----------------------------------------------------------
   ConditionBadge
   @param {'Mint'|'Near Mint'|'Lightly Played'|'Moderately Played'|'Heavily Played'} condition
   @param {'sm'|'md'} size
   ----------------------------------------------------------- */
export function ConditionBadge({ condition, size = 'md' }) {
  const config = CONDITION_CONFIG[condition] ?? { label: condition, cssVar: 'var(--color-text-muted)' };

  const sizeClass = size === 'sm'
    ? 'text-[10px] px-1.5 py-0.5'
    : 'text-xs px-2.5 py-1';

  return (
    <span
      className={`
        inline-flex items-center font-medium rounded-full
        border bg-transparent
        ${sizeClass}
      `.replace(/\s+/g, ' ').trim()}
      style={{
        borderColor: config.cssVar,
        color: config.cssVar,
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
  const colours = GENERIC_COLOUR_MAP[colour] ?? GENERIC_COLOUR_MAP.muted;
  const sizeClass = size === 'sm'
    ? 'text-[10px] px-1.5 py-0.5 gap-1'
    : 'text-xs px-2.5 py-1 gap-1';

  return (
    <span
      className={`
        inline-flex items-center font-semibold rounded-full border
        ${sizeClass}
      `.replace(/\s+/g, ' ').trim()}
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
