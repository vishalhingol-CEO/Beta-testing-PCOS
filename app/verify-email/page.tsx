/**
 * Verify Email Page
 * ==================
 * Shown after registration. Instructs user to check their email.
 * @since v0.6.0 G4-SA
 */
import { AuthCard } from '@/components/auth/AuthCard';
import Link         from 'next/link';

interface PageProps { searchParams: { email?: string } }

export default function VerifyEmailPage({ searchParams }: PageProps) {
  const email = searchParams.email ?? 'your email';
  return (
    <AuthCard title="Check your email">
      <div className="flex flex-col gap-5 text-center">
        <div className="text-4xl" aria-hidden="true">📬</div>
        <div>
          <p className="text-sm" style={{ color: 'var(--color-fg)' }}>
            We sent a verification link to
          </p>
          <p className="mt-1 font-semibold text-sm" style={{ color: 'var(--color-brand)' }}>
            {email}
          </p>
        </div>
        <p className="text-sm" style={{ color: 'var(--color-muted)' }}>
          Click the link in the email to activate your account. The link expires in 24 hours.
        </p>
        <p className="text-xs" style={{ color: 'var(--color-muted)' }}>
          Wrong email?{' '}
          <Link href="/register" className="text-brand hover:underline" style={{ color: 'var(--color-brand)' }}>
            Start over
          </Link>
        </p>
      </div>
    </AuthCard>
  );
}
