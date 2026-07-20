/**
 * Skeleton — Loading placeholder
 * ================================
 * Shape-matched loading placeholders. Every variant reflects the shape
 * of the content it replaces — no generic spinner fallbacks.
 *
 * Variants:
 *   text    — single line of text (variable width)
 *   block   — rectangular block (card body, image)
 *   circle  — circular element (avatar, icon)
 *   bar     — thin horizontal bar (progress, stat)
 *   card    — full GlassCard-shaped placeholder with inner text lines
 *
 * The shimmer animation is defined in styles/animations.css (pcos-shimmer).
 *
 * @lifecycle Approved
 * @since v0.5.0
 * @owner Lead Frontend Architect
 */

/* ── Types ─────────────────────────────────────────────────────────────── */

type SkeletonVariant = 'text' | 'block' | 'circle' | 'bar' | 'card';

interface SkeletonProps {
  variant?:   SkeletonVariant;
  /** Width — Tailwind class or inline style. Default: 'w-full' */
  width?:     string;
  /** Height — Tailwind class. Default depends on variant */
  height?:    string;
  /** Number of text-line skeletons to stack (variant='text' only) */
  lines?:     number;
  className?: string;
  /** Accessible label (read by screen readers instead of showing placeholder) */
  'aria-label'?: string;
}

/* ── Base shimmer element ───────────────────────────────────────────────── */

function Shimmer({ className = '' }: { className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={[
        'block rounded-md',
        'bg-gradient-to-r from-surface via-surface-hover to-surface',
        'bg-[length:200%_100%]',
        'animate-shimmer',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    />
  );
}

/* ── Component ──────────────────────────────────────────────────────────── */

function Skeleton({
  variant   = 'text',
  width,
  height,
  lines     = 3,
  className = '',
  'aria-label': ariaLabel = 'Loading…',
}: SkeletonProps) {
  const widthClass  = width  ?? 'w-full';
  const wrapperBase = 'block';

  if (variant === 'text') {
    // Stack of text-line placeholders; last line is shorter (natural text shape)
    const lineCount = Math.max(1, lines);
    return (
      <span
        role="status"
        aria-label={ariaLabel}
        aria-busy="true"
        className={`${wrapperBase} space-y-2 ${widthClass} ${className}`}
      >
        {Array.from({ length: lineCount }).map((_, i) => (
          <Shimmer
            key={i}
            className={[
              height ?? 'h-4',
              // Last line is ~60% wide to mimic natural text line breaks
              i === lineCount - 1 && lineCount > 1 ? 'w-3/5' : 'w-full',
            ].join(' ')}
          />
        ))}
      </span>
    );
  }

  if (variant === 'circle') {
    const size = width ?? height ?? 'h-10 w-10';
    return (
      <span
        role="status"
        aria-label={ariaLabel}
        aria-busy="true"
        className={`block ${className}`}
      >
        <Shimmer className={`rounded-full ${size}`} />
      </span>
    );
  }

  if (variant === 'bar') {
    return (
      <span
        role="status"
        aria-label={ariaLabel}
        aria-busy="true"
        className={`${wrapperBase} ${widthClass} ${className}`}
      >
        <Shimmer className={height ?? 'h-2'} />
      </span>
    );
  }

  if (variant === 'card') {
    // Full card skeleton — mirrors GlassCard with inner text lines
    return (
      <span
        role="status"
        aria-label={ariaLabel}
        aria-busy="true"
        className={`
          block rounded-lg border border-border bg-surface p-5
          ${widthClass} ${className}
        `}
      >
        {/* Title line */}
        <Shimmer className="h-4 w-2/3 mb-4" />
        {/* Body lines */}
        <span className="block space-y-2">
          <Shimmer className="h-3 w-full" />
          <Shimmer className="h-3 w-full" />
          <Shimmer className="h-3 w-3/4" />
        </span>
        {/* Tag row */}
        <span className="flex gap-2 mt-4">
          <Shimmer className="h-5 w-14 rounded-full" />
          <Shimmer className="h-5 w-10 rounded-full" />
        </span>
      </span>
    );
  }

  // block — rectangular fill (default)
  return (
    <span
      role="status"
      aria-label={ariaLabel}
      aria-busy="true"
      className={`${wrapperBase} ${widthClass} ${className}`}
    >
      <Shimmer className={height ?? 'h-24'} />
    </span>
  );
}

export { Skeleton };
export type { SkeletonProps, SkeletonVariant };
