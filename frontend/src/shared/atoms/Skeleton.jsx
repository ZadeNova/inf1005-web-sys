/**
 * Skeleton.jsx — Vapour FT Atom
 *
 * Usage:
 *   <Skeleton width="100%" height={20} />
 *   <Skeleton variant="circle" width={40} height={40} />
 *   <Skeleton variant="card" />        ← pre-built AssetCard skeleton
 *   <Skeleton variant="text" lines={3} />
 *
 * Uses the .vft-skeleton shimmer class defined in index.css.
 * aria-hidden="true" + role="status" on wrapper for screen readers.
 */

/* Base shimmer block */
function SkeletonBlock({ width = '100%', height = 16, rounded = 'md', className = '' }) {
  const radiusMap = {
    sm:   'rounded-(--radius-sm)]',
    md:   'rounded-(--radius-md)]',
    lg:   'rounded-(--radius-lg)]',
    full: 'rounded-full',
  };

  return (
    <div
      aria-hidden="true"
      className={`vft-skeleton ${radiusMap[rounded] ?? radiusMap.md} ${className}`}
      style={{
        width: typeof width === 'number' ? `${width}px` : width,
        height: typeof height === 'number' ? `${height}px` : height,
      }}
    />
  );
}

/* Pre-built: AssetCard skeleton */
function AssetCardSkeleton() {
  return (
    <div className="bg-(--color-surface)der border-(--color-border)] rounded-(--radius-lg)] p-4 space-y-3">
      {/* Image placeholder */}
      <SkeletonBlock width="100%" height={160} rounded="md" />
      {/* Title */}
      <SkeletonBlock width="70%" height={16} />
      {/* Badges row */}
      <div className="flex gap-2">
        <SkeletonBlock width={72} height={22} rounded="full" />
        <SkeletonBlock width={60} height={22} rounded="full" />
      </div>
      {/* Collection */}
      <SkeletonBlock width="50%" height={12} />
      {/* Price + button row */}
      <div className="flex items-center justify-between pt-1">
        <SkeletonBlock width={80} height={20} />
        <SkeletonBlock width={80} height={36} rounded="md" />
      </div>
    </div>
  );
}

/* Pre-built: text lines */
function TextSkeleton({ lines = 3 }) {
  const widths = ['100%', '85%', '60%', '75%', '90%'];
  return (
    <div className="space-y-2">
      {Array.from({ length: lines }, (_, i) => (
        <SkeletonBlock key={i} width={widths[i % widths.length]} height={14} />
      ))}
    </div>
  );
}

/* Pre-built: stat card */
function StatSkeleton() {
  return (
    <div className="bg-(--color-surface)] border border-(--color-border)] rounded-(--radius-lg)] p-4 space-y-2">
      <SkeletonBlock width={24} height={24} rounded="sm" />
      <SkeletonBlock width="60%" height={28} />
      <SkeletonBlock width="40%" height={12} />
    </div>
  );
}

/**
 * Main Skeleton export
 * @param {'block'|'circle'|'card'|'text'|'stat'} variant
 */
export default function Skeleton({
  variant = 'block',
  width,
  height,
  lines,
  className = '',
  label = 'Loading...',
}) {
  return (
    <div role="status" aria-label={label}>
      {variant === 'card' && <AssetCardSkeleton />}
      {variant === 'text' && <TextSkeleton lines={lines} />}
      {variant === 'stat' && <StatSkeleton />}
      {variant === 'circle' && (
        <SkeletonBlock width={width ?? 40} height={height ?? 40} rounded="full" className={className} />
      )}
      {variant === 'block' && (
        <SkeletonBlock width={width ?? '100%'} height={height ?? 16} className={className} />
      )}
      <span className="sr-only">{label}</span>
    </div>
  );
}
