/**
 * GlassCard — Glassmorphic card surface
 * ========================================
 * The base card primitive. All content cards in PCOS extend or compose this.
 * Three variants: default, elevated, highlighted (violet accent glow).
 * Hover state: border glow + shadow lift.
 * Clickable variant: adds cursor-pointer, full hover/active states, and
 * internal keyboard activation (Enter + Space) — WCAG 2.1 SC 2.1.1 compliant.
 *
 * When clickable={true}:
 *   - role defaults to "button" (overridable via prop)
 *   - tabIndex defaults to 0 (overridable via prop)
 *   - Enter and Space trigger the onClick handler automatically
 *   - Consumers supply only onClick; keyboard support is guaranteed
 *
 * @lifecycle Approved
 * @since v0.5.0
 * @owner Lead Frontend Architect
 */

/* ── Types ─────────────────────────────────────────────────────────────── */

type CardVariant = 'default' | 'elevated' | 'highlighted';

interface GlassCardProps {
  variant?:   CardVariant;
  /** Makes the entire card a clickable element with hover/active states */
  clickable?: boolean;
  /** Padding preset: none, sm, md (default), lg */
  padding?:   'none' | 'sm' | 'md' | 'lg';
  children:   React.ReactNode;
  className?: string;
  /** Forwarded to the root element */
  onClick?:   React.MouseEventHandler<HTMLDivElement>;
  /** onKeyDown forwarded to root; internal Enter/Space handler runs first */
  onKeyDown?: React.KeyboardEventHandler<HTMLDivElement>;
  tabIndex?:  number;
  role?:      string;
  'aria-label'?: string;
}

/* ── Style Maps ─────────────────────────────────────────────────────────── */

const variantClasses: Record<CardVariant, string> = {
  default:
    'bg-surface border-border ' +
    'hover:border-border-glow hover:shadow-md',
  elevated:
    'bg-surface-2 border-border shadow-md ' +
    'hover:border-border-glow hover:shadow-lg',
  highlighted:
    'bg-surface border-brand/30 shadow-glow-brand ' +
    'hover:border-brand/50',
};

const paddingClasses = {
  none: '',
  sm:   'p-3',
  md:   'p-5',
  lg:   'p-6',
};

/* ── Component ──────────────────────────────────────────────────────────── */

function GlassCard({
  variant   = 'default',
  clickable = false,
  padding   = 'md',
  children,
  className = '',
  onClick,
  onKeyDown,
  tabIndex,
  role,
  'aria-label': ariaLabel,
}: GlassCardProps) {
  /**
   * MAJ-01 fix — internal keyboard handler for clickable mode.
   *
   * When clickable=true and onClick is provided, Enter and Space synthesise
   * a click event so keyboard users receive identical behaviour to mouse users.
   * WCAG 2.1 SC 2.1.1 (Keyboard, Level A) — guaranteed at component level
   * so no consumer can accidentally omit keyboard support.
   *
   * If the consumer also supplies onKeyDown, it runs after the internal handler
   * (unless the consumer called e.stopPropagation() in their own handler —
   * but since ours runs first via the combined handler below, both always fire).
   */
  const handleKeyDown = clickable && onClick
    ? (e: React.KeyboardEvent<HTMLDivElement>) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault(); // prevent Space from scrolling the page
          onClick(e as unknown as React.MouseEvent<HTMLDivElement>);
        }
        onKeyDown?.(e); // forward to consumer handler if provided
      }
    : onKeyDown; // non-clickable: just forward consumer handler (or undefined)

  return (
    <div
      // Semantic defaults for clickable mode — consumers may override
      role={role ?? (clickable ? 'button' : undefined)}
      aria-label={ariaLabel}
      tabIndex={tabIndex ?? (clickable ? 0 : undefined)}
      onClick={onClick}
      onKeyDown={handleKeyDown}
      className={[
        'rounded-lg border',
        'backdrop-blur-glass',
        'transition-all duration-normal',
        variantClasses[variant],
        paddingClasses[padding],
        clickable
          ? 'cursor-pointer select-none active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-bg'
          : '',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {children}
    </div>
  );
}

export { GlassCard };
export type { GlassCardProps, CardVariant };
