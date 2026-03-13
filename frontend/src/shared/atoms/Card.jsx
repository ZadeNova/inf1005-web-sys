/**
 * Card.jsx — Vapour FT Atom
 * LEAD ONLY — shared atom, do not modify without Frontend Lead approval.
 *
 * Usage:
 *   <Card>Content here</Card>
 *   <Card glow>Hoverable card with accent glow</Card>
 *   <Card variant="elevated" padding="lg">...</Card>
 *   <Card as="button" onClick={...}>Clickable card</Card>
 */

const VARIANT_STYLES = {
  default: `
    bg-(--color-surface)
    border border-(--color-border)
  `,
  elevated: `
    bg-(--color-surface)
    border border-(--color-border)
    shadow-[0_4px_24px_rgba(0,0,0,0.3)]
  `,
  inset: `
    bg-(--color-surface-2)
    border border-(--color-border-subtle)
  `,
};

const PADDING_STYLES = {
  none: '',
  sm:   'p-3',
  md:   'p-4',
  lg:   'p-6',
};

/**
 * @param {'default'|'elevated'|'inset'} variant
 * @param {'none'|'sm'|'md'|'lg'} padding
 * @param {boolean} glow           - adds indigo glow on hover
 * @param {boolean} interactive    - adds pointer cursor and scale on click
 * @param {string} as              - HTML element tag (default: 'div')
 * @param {string} className
 */
export default function Card({
  children,
  variant = 'default',
  padding = 'md',
  glow = false,
  interactive = false,
  as: Tag = 'div',
  className = '',
  onClick,
  ...rest
}) {
  const glowClass = glow
    ? 'transition-shadow duration-(--transition-slow) hover:shadow-[0_0_0_1px_var(--color-accent),_0_0_24px_var(--color-accent-glow)'
    : '';

  const interactiveClass = interactive
    ? 'cursor-pointer active:scale-[0.99] transition-transform duration-(--transition-fast)'
    : '';

  return (
    <Tag
      onClick={onClick}
      className={`
        rounded-lg
        ${VARIANT_STYLES[variant] ?? VARIANT_STYLES.default}
        ${PADDING_STYLES[padding] ?? PADDING_STYLES.md}
        ${glowClass}
        ${interactiveClass}
        ${className}
      `.replace(/\s+/g, ' ').trim()}
      {...rest}
    >
      {children}
    </Tag>
  );
}
