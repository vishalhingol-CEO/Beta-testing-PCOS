/**
 * Spinner — Loading indicator
 * ============================
 * SVG-based circular spinner. Three sizes: sm, md, lg.
 * GPU-composited rotation (transform only).
 * Accessible: role="status" with aria-label.
 *
 * For page-level loading: use Skeleton variants instead.
 * Spinner is for inline/button loading states.
 *
 * @lifecycle Approved
 * @since v0.5.0
 * @owner Lead Frontend Architect
 */

/* ── Types ─────────────────────────────────────────────────────────────── */

type SpinnerSize  = 'sm' | 'md' | 'lg';

interface SpinnerProps {
  size?:      SpinnerSize;
  /** Accessible label. Default: 'Loading…' */
  label?:     string;
  /** Colour class. Default: 'text-brand' */
  colour?:    string;
  className?: string;
}

/* ── Size map ───────────────────────────────────────────────────────────── */

const sizePx: Record<SpinnerSize, number> = {
  sm: 16,
  md: 24,
  lg: 36,
};

/* ── Component ──────────────────────────────────────────────────────────── */

function Spinner({
  size      = 'md',
  label     = 'Loading…',
  colour    = 'text-brand',
  className = '',
}: SpinnerProps) {
  const px = sizePx[size];

  return (
    <span
      role="status"
      aria-label={label}
      className={`inline-flex items-center justify-center ${colour} ${className}`}
    >
      <svg
        width={px}
        height={px}
        viewBox="0 0 24 24"
        fill="none"
        className="animate-spin"
        aria-hidden="true"
      >
        {/* Background track */}
        <circle
          cx="12"
          cy="12"
          r="9"
          stroke="currentColor"
          strokeWidth="2"
          strokeOpacity="0.2"
        />
        {/* Spinning arc */}
        <path
          d="M12 3A9 9 0 0 1 21 12"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
      {/* Visually hidden text for screen readers */}
      <span className="sr-only">{label}</span>
    </span>
  );
}

export { Spinner };
export type { SpinnerProps, SpinnerSize };
