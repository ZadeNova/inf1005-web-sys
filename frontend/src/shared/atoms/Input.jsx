/**
 * Input.jsx — Vapour FT Atom
 * LEAD ONLY — shared atom, do not modify without Frontend Lead approval.
 *
 * Usage:
 *   <Input id="name" label="Card Name" placeholder="e.g. Dark Sorcerer Supreme" />
 *   <Input id="price" label="Price (USD)" type="number" error="Price must be greater than zero" />
 *   <Input id="search" label="Search" helper="Search across all sets" />
 */

export default function Input({
  id,
  label,
  type = 'text',
  placeholder = '',
  value,
  onChange,
  error = '',
  helper = '',
  disabled = false,
  required = false,
  className = '',
  inputClassName = '',
  ...rest
}) {
  const hasError = Boolean(error);

  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {label && (
        <label
          htmlFor={id}
          className="text-sm font-semibold text-(--color-text-primary)"
        >
          {label}
          {required && (
            <span className="text-(--color-danger)1" aria-hidden="true">*</span>
          )}
        </label>
      )}

      <input
        id={id}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        disabled={disabled}
        required={required}
        aria-describedby={
          hasError ? `${id}-error` : helper ? `${id}-helper` : undefined
        }
        aria-invalid={hasError}
        className={`
          w-full
          px-3 py-2.5
          rounded-md]
          text-sm
          text-(--color-text-primary)
          bg-(--color-input-bg)
          border
          placeholder:text-(--color-input-placeholder)
          transition-colors duration-(--transition-base)
          outline-none
          focus:ring-2 focus:ring-(--color-input-focus) focus:ring-offset-0
          disabled:cursor-not-allowed disabled:opacity-50
          ${hasError
            ? 'border-(--color-input-error) focus:ring-(--color-input-error)'
            : 'border-(--color-input-border) focus:border-(--color-input-focus)'
          }
          ${inputClassName}
        `.replace(/\s+/g, ' ').trim()}
        {...rest}
      />

      {helper && !hasError && (
        <p id={`${id}-helper`} className="text-xs text-(--color-text-muted)">
          {helper}
        </p>
      )}

      {hasError && (
        <p
          id={`${id}-error`}
          role="alert"
          className="text-xs text-(--color-danger) flex items-center gap-1"
        >
          {/* Warning icon — non-colour indicator for errors */}
          <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2zm0 15a1 1 0 1 1 0-2 1 1 0 0 1 0 2zm1-4a1 1 0 0 1-2 0V8a1 1 0 0 1 2 0v5z"/>
          </svg>
          {error}
        </p>
      )}
    </div>
  );
}
