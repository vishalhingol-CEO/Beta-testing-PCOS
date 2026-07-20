/**
 * ErrorState — Consistent Error Display
 * =======================================
 * Used by every error.tsx boundary and API failure path.
 * Errors explain what went wrong and offer a recovery action.
 * Never vague. Never apologetic. Always actionable.
 *
 * @param title    - What failed
 * @param message  - Optional technical detail
 * @param onRetry  - Retry handler (from Next.js error boundary `reset`)
 * @param size     - Size variant for panel vs full-page
 *
 * @lifecycle Approved
 * @since v0.5.0 Phase H
 */

'use client';
// Reason: onRetry is a client-side reset function from error boundaries

import { AlertTriangle, RefreshCcw } from 'lucide-react';

interface ErrorStateProps {
  title:     string;
  message?:  string;
  onRetry?:  () => void;
  size?:     'sm' | 'md' | 'lg';
  className?: string;
}

const SIZE_CONFIG = {
  sm: { wrapper: 'py-8 px-4',  icon: 16, title: 'text-sm',  desc: 'text-xs' },
  md: { wrapper: 'py-12 px-6', icon: 20, title: 'text-base', desc: 'text-sm' },
  lg: { wrapper: 'py-20 px-8', icon: 24, title: 'text-lg',  desc: 'text-sm' },
} as const;

export function ErrorState({
  title,
  message,
  onRetry,
  size      = 'md',
  className = '',
}: ErrorStateProps) {
  const cfg = SIZE_CONFIG[size];

  return (
    <div
      className={`flex flex-col items-center justify-center text-center ${cfg.wrapper} ${className}`}
      role="alert"
      aria-live="assertive"
      data-testid="error-state"
    >
      <div
        className="mb-4 flex items-center justify-center rounded-2xl p-3"
        style={{
          backgroundColor: 'color-mix(in srgb, var(--color-danger) 10%, transparent)',
          color:            'var(--color-danger)',
        }}
        aria-hidden="true"
      >
        <AlertTriangle size={cfg.icon} />
      </div>

      <h3 className={`font-semibold text-fg ${cfg.title}`}>{title}</h3>

      {message && (
        <p className={`mt-2 max-w-sm text-muted ${cfg.desc}`}>{message}</p>
      )}

      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          data-testid="error-state-retry-btn"
          className="
            mt-5 inline-flex items-center gap-2 rounded-lg border px-4 py-2
            text-sm font-medium transition-colors duration-fast
            hover:bg-surface-hover
            focus-visible:outline-none focus-visible:ring-2
            focus-visible:ring-brand focus-visible:ring-offset-2
            focus-visible:ring-offset-bg
          "
          style={{ borderColor: 'var(--color-border)', color: 'var(--color-fg)' }}
        >
          <RefreshCcw size={14} aria-hidden="true" />
          Try again
        </button>
      )}
    </div>
  );
}
