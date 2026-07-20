/**
 * Badge — Inline label for tags, statuses, and capability labels
 * ================================================================
 * Six colour variants mapping to design system semantic colours.
 * Two sizes: sm, md.
 * Optional leading dot indicator for status badges.
 *
 * @lifecycle Approved
 * @since v0.5.0
 * @owner Lead Frontend Architect
 */

/* ── Types ─────────────────────────────────────────────────────────────── */

type BadgeVariant =
  | 'default'
  | 'brand'
  | 'success'
  | 'warning'
  | 'danger'
  | 'info'
  | 'muted';

type BadgeSize = 'sm' | 'md';

interface BadgeProps {
  variant?:  BadgeVariant;
  size?:     BadgeSize;
  /** Show a pulsing dot before the label (for live status indicators) */
  dot?:      boolean;
  children:  React.ReactNode;
  className?: string;
}

/* ── Style Maps ─────────────────────────────────────────────────────────── */

const variantClasses: Record<BadgeVariant, string> = {
  default: 'bg-surface-2  text-fg      border-border',
  brand:   'bg-brand/10   text-brand   border-brand/20',
  success: 'bg-success/10 text-success border-success/20',
  warning: 'bg-warning/10 text-warning border-warning/20',
  danger:  'bg-danger/10  text-danger  border-danger/20',
  info:    'bg-info/10    text-info    border-info/20',
  muted:   'bg-surface    text-muted   border-border',
};

const dotColour: Record<BadgeVariant, string> = {
  default: 'bg-muted',
  brand:   'bg-brand',
  success: 'bg-success',
  warning: 'bg-warning',
  danger:  'bg-danger',
  info:    'bg-info',
  muted:   'bg-subtle',
};

const sizeClasses: Record<BadgeSize, string> = {
  sm: 'px-1.5 py-0.5 text-xs  gap-1',
  md: 'px-2   py-1   text-xs  gap-1.5',
};

/* ── Component ──────────────────────────────────────────────────────────── */

function Badge({
  variant   = 'default',
  size      = 'md',
  dot       = false,
  children,
  className = '',
}: BadgeProps) {
  return (
    <span
      className={[
        'inline-flex items-center font-medium',
        'rounded-full border',
        'leading-none tracking-wide',
        'whitespace-nowrap',
        variantClasses[variant],
        sizeClasses[size],
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {dot && (
        <span
          aria-hidden="true"
          className={`
            inline-block h-1.5 w-1.5 rounded-full flex-shrink-0
            animate-pulse
            ${dotColour[variant]}
          `}
        />
      )}
      {children}
    </span>
  );
}

export { Badge };
export type { BadgeProps, BadgeVariant, BadgeSize };
