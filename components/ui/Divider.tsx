/**
 * Divider — Visual separator
 * ============================
 * Horizontal (default) or vertical orientation.
 * Optional centred label (used in form sections, card separators).
 *
 * @lifecycle Approved
 * @since v0.5.0
 * @owner Lead Frontend Architect
 */

/* ── Types ─────────────────────────────────────────────────────────────── */

interface DividerProps {
  orientation?: 'horizontal' | 'vertical';
  /** Optional text label centred on the divider line */
  label?:       string;
  className?:   string;
}

/* ── Component ──────────────────────────────────────────────────────────── */

function Divider({
  orientation = 'horizontal',
  label,
  className   = '',
}: DividerProps) {
  if (orientation === 'vertical') {
    return (
      <div
        role="separator"
        aria-orientation="vertical"
        className={`w-px self-stretch bg-border ${className}`}
      />
    );
  }

  if (label) {
    return (
      <div
        role="separator"
        className={`flex items-center gap-3 ${className}`}
      >
        <div className="flex-1 h-px bg-border" />
        <span className="text-xs font-medium text-subtle tracking-widest uppercase whitespace-nowrap">
          {label}
        </span>
        <div className="flex-1 h-px bg-border" />
      </div>
    );
  }

  return (
    <hr
      role="separator"
      aria-orientation="horizontal"
      className={`border-none h-px bg-border ${className}`}
    />
  );
}

export { Divider };
export type { DividerProps };
