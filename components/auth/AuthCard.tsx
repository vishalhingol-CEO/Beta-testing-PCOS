/**
 * AuthCard — Shared Auth Page Wrapper
 * =====================================
 * Glassmorphic glass card for all auth pages.
 * PCOS brand, page title, children.
 *
 * Design: dark glass aesthetic, centred on full viewport.
 * Minimal — the first impression must be premium.
 *
 * @since v0.6.0 G4-SA
 */

interface AuthCardProps {
  title:     string;
  subtitle?: string;
  children:  React.ReactNode;
}

export function AuthCard({ title, subtitle, children }: AuthCardProps) {
  return (
    <div
      className="flex min-h-screen items-center justify-center px-4 py-12"
      style={{ backgroundColor: 'var(--color-bg)' }}
    >
      <div
        className="pcos-glass w-full max-w-md rounded-2xl p-8"
        data-testid="auth-card"
      >
        {/* Brand mark */}
        <div className="mb-8 text-center">
          <p
            className="text-2xl font-bold tracking-tight"
            style={{ color: 'var(--color-brand)' }}
            aria-label="PCOS — Personal Cognitive Operating System"
          >
            PCOS
          </p>
          <p className="mt-1 text-xs" style={{ color: 'var(--color-muted)' }}>
            Personal Cognitive Operating System
          </p>
        </div>

        {/* Page heading */}
        <h1
          className="mb-1 text-xl font-semibold"
          style={{ color: 'var(--color-fg)' }}
        >
          {title}
        </h1>

        {subtitle && (
          <p className="mb-6 text-sm" style={{ color: 'var(--color-muted)' }}>
            {subtitle}
          </p>
        )}

        {children}
      </div>
    </div>
  );
}
