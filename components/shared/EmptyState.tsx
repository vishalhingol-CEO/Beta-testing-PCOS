/**
 * EmptyState — Zero Data State
 * ==============================
 * Consistent empty state for all data-displaying pages and panels.
 * Empty states are invitations to act — never failure states.
 *
 * Per CTO Strategic Alignment: every first-run user sees these states.
 * They must communicate what the page is for and what the user should do.
 *
 * @param icon        - Lucide icon component or custom SVG
 * @param title       - Primary empty state headline
 * @param description - Supporting description
 * @param action      - Optional primary CTA
 * @param size        - Size variant for panel vs full-page contexts
 *
 * @lifecycle Approved
 * @since v0.5.0 Phase H
 * @owner Lead Frontend Architect
 */

import Link from 'next/link';

interface EmptyStateAction {
  label: string;
  href:  string;
}

interface EmptyStateProps {
  icon?:        React.ReactNode;
  title:        string;
  description?: string;
  action?:      EmptyStateAction;
  size?:        'sm' | 'md' | 'lg';
  className?:   string;
}

const SIZE_CONFIG = {
  sm: { wrapper: 'py-8 px-4',  icon: 'h-8  w-8',  title: 'text-sm',  desc: 'text-xs' },
  md: { wrapper: 'py-12 px-6', icon: 'h-10 w-10', title: 'text-base',desc: 'text-sm' },
  lg: { wrapper: 'py-20 px-8', icon: 'h-12 w-12', title: 'text-lg',  desc: 'text-sm' },
} as const;

export function EmptyState({
  icon,
  title,
  description,
  action,
  size      = 'md',
  className = '',
}: EmptyStateProps) {
  const cfg = SIZE_CONFIG[size];

  return (
    <div
      className={`
        flex flex-col items-center justify-center text-center
        ${cfg.wrapper} ${className}
      `.trim()}
      data-testid="empty-state"
      role="status"
      aria-label={title}
    >
      {icon && (
        <div
          className={`mb-4 flex items-center justify-center rounded-2xl p-3 ${cfg.icon}`}
          style={{
            backgroundColor: 'color-mix(in srgb, var(--color-brand) 10%, transparent)',
            color:            'var(--color-brand)',
          }}
          aria-hidden="true"
        >
          {icon}
        </div>
      )}

      <h3
        className={`font-semibold text-fg ${cfg.title}`}
      >
        {title}
      </h3>

      {description && (
        <p
          className={`mt-2 max-w-xs text-muted ${cfg.desc}`}
        >
          {description}
        </p>
      )}

      {action && (
        <Link
          href={action.href}
          data-testid="empty-state-action"
          className="
            mt-5 inline-flex items-center gap-2 rounded-lg px-4 py-2
            text-sm font-medium text-white
            transition-opacity duration-fast hover:opacity-90
            focus-visible:outline-none focus-visible:ring-2
            focus-visible:ring-brand focus-visible:ring-offset-2
            focus-visible:ring-offset-bg
          "
          style={{ backgroundColor: 'var(--color-brand)' }}
        >
          {action.label}
        </Link>
      )}
    </div>
  );
}
