/**
 * CreateAssetForm.jsx — Lead Island
 * Mounts via: mountIsland('create-asset-form-root', CreateAssetForm)
 * PHP view: backend/src/Views/admin.php
 *
 * Admin form to mint a new asset. Submits multipart/form-data (file upload).
 * On success: clears form, shows green message with link to the new listing.
 *
 *   POST /api/v1/admin/assets  (multipart/form-data)
 *   Fields: name, description, rarity, condition_state, collection, price, image
 *   Returns 201: { success: true, asset: { id, name, listingId } }
 *   Returns 422/500: { success: false, message: '...' }
 *
 * IMPORTANT: Do NOT set Content-Type header manually — the browser sets it
 * with the correct multipart boundary when using FormData.
 */

import { useState, useRef, useCallback } from 'react';
import Card   from '../../shared/atoms/Card.jsx';
import Button from '../../shared/atoms/Button.jsx';

// ── Constants matching DB ENUMs and frontend RARITY constants exactly ─────────
const RARITIES = [
  { value: 'COMMON',      label: 'Common' },
  { value: 'UNCOMMON',    label: 'Uncommon' },
  { value: 'RARE',        label: 'Rare' },
  { value: 'ULTRA_RARE',  label: 'Ultra Rare' },
  { value: 'SECRET_RARE', label: 'Secret Rare' },
];

const CONDITIONS = [
  'Mint',
  'Near Mint',
  'Lightly Played',
  'Moderately Played',
  'Heavily Played',
];

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

// ── Shared input styles (mirrors the rest of the admin panel) ─────────────────
const inputClass = `
  w-full px-3 py-2 text-sm rounded-md
  bg-(--color-input-bg) border border-(--color-input-border)
  text-(--color-text-primary) placeholder:text-(--color-input-placeholder)
  focus:outline-none focus:border-(--color-input-focus)
  transition-colors
`.trim();

const labelClass = 'block text-sm font-medium text-(--color-text-secondary) mb-1';

// ── Empty form state factory ──────────────────────────────────────────────────
function emptyForm() {
  return {
    name:            '',
    description:     '',
    rarity:          'COMMON',
    condition_state: 'Mint',
    collection:      '',
    price:           '',
  };
}

// ── Upload icon ───────────────────────────────────────────────────────────────
const UploadIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}
       className="w-8 h-8 text-(--color-text-muted)" aria-hidden="true">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
    <polyline points="17 8 12 3 7 8"/>
    <line x1="12" y1="3" x2="12" y2="15"/>
  </svg>
);

// ── Rarity badge preview (mirrors Badge.jsx RarityBadge inline) ───────────────
const RARITY_SYMBOL = {
  COMMON:      '○',
  UNCOMMON:    '◆',
  RARE:        '★',
  ULTRA_RARE:  '✦',
  SECRET_RARE: '♛',
};

// ════════════════════════════════════════════════════════════════════════════
export default function CreateAssetForm({ csrfToken = '' }) {
  const [form,        setForm]        = useState(emptyForm());
  const [imageFile,   setImageFile]   = useState(null);
  const [previewUrl,  setPreviewUrl]  = useState(null);
  const [loading,     setLoading]     = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [serverError, setServerError] = useState(null);
  const [success,     setSuccess]     = useState(null); // { name, listingId }

  const fileInputRef = useRef(null);

  // ── Field helpers ───────────────────────────────────────────────────────
  function update(field) {
    return (e) => {
      setForm(prev => ({ ...prev, [field]: e.target.value }));
      // Clear the field error as the user corrects it
      if (fieldErrors[field]) {
        setFieldErrors(prev => ({ ...prev, [field]: undefined }));
      }
    };
  }

  // ── Image selection ─────────────────────────────────────────────────────
  const handleImageChange = useCallback((file) => {
    if (!file) return;

    // Revoke old object URL to prevent memory leaks
    if (previewUrl) URL.revokeObjectURL(previewUrl);

    if (!ALLOWED_TYPES.includes(file.type)) {
      setFieldErrors(prev => ({ ...prev, image: 'Only JPEG, PNG, and WebP files are allowed.' }));
      setImageFile(null);
      setPreviewUrl(null);
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      setFieldErrors(prev => ({ ...prev, image: 'File must be under 5 MB.' }));
      setImageFile(null);
      setPreviewUrl(null);
      return;
    }

    setFieldErrors(prev => ({ ...prev, image: undefined }));
    setImageFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  }, [previewUrl]);

  function handleFileInputChange(e) {
    handleImageChange(e.target.files?.[0] ?? null);
  }

  // ── Drag-and-drop ───────────────────────────────────────────────────────
  function handleDrop(e) {
    e.preventDefault();
    handleImageChange(e.dataTransfer.files?.[0] ?? null);
  }

  function handleDragOver(e) {
    e.preventDefault();
  }

  // ── Client-side validation ──────────────────────────────────────────────
  function validate() {
    const errors = {};
    if (!form.name.trim())       errors.name        = 'Asset name is required.';
    if (!form.description.trim()) errors.description = 'Description is required.';
    if (!form.collection.trim()) errors.collection  = 'Collection is required.';
    const p = parseFloat(form.price);
    if (!form.price || isNaN(p) || p <= 0 || p > 999999.99) {
      errors.price = 'Enter a price between $0.01 and $999,999.99.';
    }
    if (!imageFile)              errors.image       = 'An image file is required.';
    return errors;
  }

  // ── Form reset ──────────────────────────────────────────────────────────
  function resetForm() {
    setForm(emptyForm());
    setFieldErrors({});
    setServerError(null);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    setImageFile(null);
    // Reset the native file input so the same file can be re-selected
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  // ── Submit ──────────────────────────────────────────────────────────────
  async function handleSubmit() {
    setServerError(null);
    setSuccess(null);

    const errors = validate();
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setLoading(true);

    const csrf = csrfToken
      || document.querySelector('meta[name="csrf-token"]')?.content
      || '';

    const formData = new FormData();
    formData.append('name',            form.name.trim());
    formData.append('description',     form.description.trim());
    formData.append('rarity',          form.rarity);
    formData.append('condition_state', form.condition_state);
    formData.append('collection',      form.collection.trim());
    formData.append('price',           String(parseFloat(form.price)));
    formData.append('image',           imageFile);

    try {
      const res = await fetch('/api/v1/admin/assets', {
        method:  'POST',
        // DO NOT set Content-Type — browser sets multipart boundary automatically
        headers: { 'X-CSRF-Token': csrf },
        body:    formData,
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok || !data.success) {
        setServerError(data.message ?? `Server error ${res.status}. Please try again.`);
        return;
      }

      // Success — record result, then wipe the form
      setSuccess({ name: data.asset.name, listingId: data.asset.listingId });
      resetForm();

    } catch (err) {
      setServerError('Network error. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  }

  // ── Render ──────────────────────────────────────────────────────────────
  return (
    <Card variant="default" padding="md">
      <div className="flex flex-col gap-5">

        {/* ── Success banner ─────────────────────────────────────────── */}
        {success && (
          <div
            role="status"
            aria-live="polite"
            className="flex items-center justify-between gap-3 px-4 py-3 rounded-lg
                       bg-(--color-success-subtle) border border-(--color-success)"
          >
            <div className="flex items-center gap-2">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}
                   className="w-4 h-4 text-(--color-success) shrink-0" aria-hidden="true">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              <p className="text-sm font-semibold text-(--color-success)">
                <span className="font-bold">{success.name}</span> minted and listed successfully.
              </p>
            </div>
            <a
              href={`/listings/${success.listingId}`}
              className="text-xs font-semibold text-(--color-success) underline
                         hover:opacity-80 transition-opacity shrink-0"
            >
              View listing →
            </a>
          </div>
        )}

        {/* ── Server error banner ─────────────────────────────────────── */}
        {serverError && (
          <p
            role="alert"
            className="text-sm text-(--color-danger) bg-(--color-danger-subtle)
                       border border-(--color-danger) rounded-lg px-4 py-3"
          >
            {serverError}
          </p>
        )}

        {/* ── Two-column layout on sm+ ────────────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

          {/* Name */}
          <div className="flex flex-col gap-1">
            <label htmlFor="asset-name" className={labelClass}>
              Name <span aria-hidden="true" className="text-(--color-danger)">*</span>
            </label>
            <input
              id="asset-name"
              type="text"
              value={form.name}
              onChange={update('name')}
              placeholder="e.g. Glacial Trace AWP"
              aria-required="true"
              aria-describedby={fieldErrors.name ? 'asset-name-error' : undefined}
              aria-invalid={!!fieldErrors.name}
              className={inputClass}
            />
            {fieldErrors.name && (
              <p id="asset-name-error" role="alert" className="text-xs text-(--color-danger)">
                {fieldErrors.name}
              </p>
            )}
          </div>

          {/* Collection */}
          <div className="flex flex-col gap-1">
            <label htmlFor="asset-collection" className={labelClass}>
              Collection <span aria-hidden="true" className="text-(--color-danger)">*</span>
            </label>
            <input
              id="asset-collection"
              type="text"
              value={form.collection}
              onChange={update('collection')}
              placeholder="e.g. Shadowfall"
              aria-required="true"
              aria-describedby={fieldErrors.collection ? 'asset-collection-error' : undefined}
              aria-invalid={!!fieldErrors.collection}
              className={inputClass}
            />
            {fieldErrors.collection && (
              <p id="asset-collection-error" role="alert" className="text-xs text-(--color-danger)">
                {fieldErrors.collection}
              </p>
            )}
          </div>

          {/* Rarity */}
          <div className="flex flex-col gap-1">
            <label htmlFor="asset-rarity" className={labelClass}>
              Rarity <span aria-hidden="true" className="text-(--color-danger)">*</span>
            </label>
            <select
              id="asset-rarity"
              value={form.rarity}
              onChange={update('rarity')}
              aria-required="true"
              className={inputClass}
            >
              {RARITIES.map(r => (
                <option key={r.value} value={r.value}>
                  {RARITY_SYMBOL[r.value]} {r.label}
                </option>
              ))}
            </select>
          </div>

          {/* Condition */}
          <div className="flex flex-col gap-1">
            <label htmlFor="asset-condition" className={labelClass}>
              Condition <span aria-hidden="true" className="text-(--color-danger)">*</span>
            </label>
            <select
              id="asset-condition"
              value={form.condition_state}
              onChange={update('condition_state')}
              aria-required="true"
              className={inputClass}
            >
              {CONDITIONS.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* Price */}
          <div className="flex flex-col gap-1 sm:col-span-2 sm:max-w-xs">
            <label htmlFor="asset-price" className={labelClass}>
              Listing Price (USD) <span aria-hidden="true" className="text-(--color-danger)">*</span>
            </label>
            <div className="relative">
              <span
                className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-(--color-text-muted)"
                aria-hidden="true"
              >
                $
              </span>
              <input
                id="asset-price"
                type="number"
                min="0.01"
                max="999999.99"
                step="0.01"
                value={form.price}
                onChange={update('price')}
                placeholder="0.00"
                aria-required="true"
                aria-describedby={fieldErrors.price ? 'asset-price-error' : 'asset-price-hint'}
                aria-invalid={!!fieldErrors.price}
                className={`${inputClass} pl-7`}
              />
            </div>
            {fieldErrors.price ? (
              <p id="asset-price-error" role="alert" className="text-xs text-(--color-danger)">
                {fieldErrors.price}
              </p>
            ) : (
              <p id="asset-price-hint" className="text-xs text-(--color-text-muted)">
                Asset will go live at this price immediately.
              </p>
            )}
          </div>

        </div>

        {/* Description — full width */}
        <div className="flex flex-col gap-1">
          <label htmlFor="asset-description" className={labelClass}>
            Description <span aria-hidden="true" className="text-(--color-danger)">*</span>
          </label>
          <textarea
            id="asset-description"
            rows={3}
            value={form.description}
            onChange={update('description')}
            placeholder="Describe the asset — flavour text, lore, traits..."
            aria-required="true"
            aria-describedby={fieldErrors.description ? 'asset-desc-error' : undefined}
            aria-invalid={!!fieldErrors.description}
            className={`${inputClass} resize-y`}
          />
          {fieldErrors.description && (
            <p id="asset-desc-error" role="alert" className="text-xs text-(--color-danger)">
              {fieldErrors.description}
            </p>
          )}
        </div>

        {/* Image upload + preview */}
        <div className="flex flex-col gap-2">
          <p className={labelClass}>
            Image <span aria-hidden="true" className="text-(--color-danger)">*</span>
          </p>

          <div className="flex flex-col sm:flex-row gap-4 items-start">

            {/* Drop zone */}
            <div
              role="button"
              tabIndex={0}
              aria-label="Upload asset image — click or drag and drop"
              onClick={() => fileInputRef.current?.click()}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') fileInputRef.current?.click(); }}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              className="flex-1 min-h-28 flex flex-col items-center justify-center gap-2
                         rounded-lg border-2 border-dashed border-(--color-border)
                         bg-(--color-surface-2) cursor-pointer
                         hover:border-(--color-accent) hover:bg-(--color-accent-subtle)
                         transition-colors focus-visible:outline-2
                         focus-visible:outline-(--color-accent) focus-visible:outline-offset-2"
            >
              <UploadIcon />
              <p className="text-xs text-(--color-text-muted) text-center px-2">
                Click or drag & drop · JPEG, PNG, WebP · Max 5 MB
              </p>
              {/* Hidden native file input */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleFileInputChange}
                className="sr-only"
                aria-hidden="true"
                tabIndex={-1}
              />
            </div>

            {/* Live preview thumbnail (max 200×200) */}
            {previewUrl && (
              <div className="shrink-0 flex flex-col gap-1.5 items-center">
                <div
                  className="w-50 h-50 rounded-lg overflow-hidden
                             border border-(--color-border) bg-(--color-surface-2)"
                  aria-label="Image preview"
                >
                  <img
                    src={previewUrl}
                    alt="Preview of selected asset image"
                    className="w-full h-full object-cover"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => {
                    URL.revokeObjectURL(previewUrl);
                    setPreviewUrl(null);
                    setImageFile(null);
                    if (fileInputRef.current) fileInputRef.current.value = '';
                  }}
                  className="text-xs text-(--color-text-muted) hover:text-(--color-danger)
                             transition-colors"
                  aria-label="Remove selected image"
                >
                  Remove image
                </button>
              </div>
            )}

          </div>

          {fieldErrors.image && (
            <p role="alert" className="text-xs text-(--color-danger)">
              {fieldErrors.image}
            </p>
          )}
          {imageFile && !fieldErrors.image && (
            <p className="text-xs text-(--color-text-muted)">
              Selected: <span className="font-medium text-(--color-text-secondary)">{imageFile.name}</span>
              {' '}({(imageFile.size / 1024).toFixed(1)} KB)
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 pt-1">
          <Button
            variant="primary"
            size="md"
            loading={loading}
            disabled={loading}
            onClick={handleSubmit}
          >
            Mint & List Asset
          </Button>
          {(Object.keys(fieldErrors).some(k => fieldErrors[k]) || serverError) && (
            <p className="text-xs text-(--color-text-muted)">
              Fix the errors above before submitting.
            </p>
          )}
        </div>

      </div>
    </Card>
  );
}