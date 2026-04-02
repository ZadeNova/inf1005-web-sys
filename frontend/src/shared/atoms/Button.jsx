/**
 * Button.jsx — Vapour FT Atom
 * LEAD ONLY — shared atom, do not modify without Frontend Lead approval.
 *
 * Usage:
 *   <Button>Primary Action</Button>
 *   <Button variant="secondary">Secondary</Button>
 *   <Button variant="danger" icon={<TrashIcon />}>Delete</Button>
 *   <Button variant="primary" loading>Saving...</Button>
 *   <Button variant="primary" disabled>Unavailable</Button>
 *   <Button variant="primary" size="sm">Small</Button>
 *
 * All colours resolved from CSS variables — zero hardcoded hex values.
 */

const VARIANT_STYLES = {
  primary: {
    base: `
      bg-(--color-accent)
      text-(--color-accent-text)
      border border-transparent
      hover:bg-(--color-accent-hover)
      active:scale-[0.98]
      shadow-[0_0_0_0_var(--color-accent-glow)
      hover:shadow-[0_0_16px_var(--color-accent-glow)
    `,
    disabled: `
      bg-(--color-surface-3)
      text-(--color-text-muted)
      border border-(--color-border)
      cursor-not-allowed
      shadow-none
    `,
  },
  secondary: {
    base: `
      bg-transparent
      text-(--color-text-primary)
      border border-(--color-border)
      hover:border-(--color-accent)
      hover:text-(--color-accent)
      hover:bg-(--color-accent-subtle)
      active:scale-[0.98]
    `,
    disabled: `
      bg-transparent
      text-(--color-text-muted)
      border border-(--color-border)
      cursor-not-allowed
    `,
  },
  danger: {
    base: `
      bg-(--color-danger)
      text-white
      border border-transparent
      hover:bg-(--color-danger-hover)
      hover:shadow-[0_0_16px_var(--color-danger-subtle)
      active:scale-[0.98]
    `,
    disabled: `
      bg-(--color-surface-3)
      text-(--color-text-muted)
      border border-(--color-border)
      cursor-not-allowed
    `,
  },
  ghost: {
    base: `
      bg-transparent
      text-(--color-text-secondary)
      border border-transparent
      hover:bg-(--color-surface-2)
      hover:text-(--color-text-primary)
      active:scale-[0.98]
    `,
    disabled: `
      bg-transparent
      text-(--color-text-muted)
      cursor-not-allowed
    `,
  },
};

const SIZE_STYLES = {
  sm:  'px-3 py-1.5 text-xs gap-1.5',
  md:  'px-4 py-2.5 text-sm gap-2',
  lg:  'px-6 py-3 text-base gap-2.5',
};

/**
 * @param {'primary'|'secondary'|'danger'|'ghost'} variant
 * @param {'sm'|'md'|'lg'} size
 * @param {boolean} loading    - shows spinner, disables interaction
 * @param {boolean} disabled
 * @param {React.ReactNode} icon - optional leading icon
 * @param {string} className   - additional classes (use sparingly)
 */
export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  icon = null,
  type = 'button',
  onClick,
  className = '',
  'aria-label': ariaLabel,
}) {
  const isDisabled = disabled || loading;
  const styles = VARIANT_STYLES[variant] ?? VARIANT_STYLES.primary;
  const variantClass = isDisabled ? styles.disabled : styles.base;

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={isDisabled}
      aria-label={ariaLabel}
      aria-busy={loading}
      className={`
        inline-flex items-center justify-center
        font-semibold rounded-md]
        transition-all duration-(--transition-base)
        focus-visible:outline-2 focus-visible:outline-(--color-accent) focus-visible:outline-offset-2
        select-none
        ${SIZE_STYLES[size] ?? SIZE_STYLES.md}
        ${variantClass}
        ${className}
      `.replace(/\s+/g, ' ').trim()}
    >
      {loading ? (
        <Spinner size={size} />
      ) : icon ? (
        <span className="shrink-0 w-4 h-4" aria-hidden="true">{icon}</span>
      ) : null}
      {children}
    </button>
  );
}

/* Internal spinner — not exported */
function Spinner({ size }) {
  const dim = size === 'sm' ? 'w-3 h-3' : size === 'lg' ? 'w-5 h-5' : 'w-4 h-4';
  return (
    <svg
      className={`${dim} animate-spin shrink-0`}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  );
}
