/**
 * Login Page
 * ===========
 * Server Component: renders AuthCard + passes URL params to LoginForm.
 * No data fetching — this is a public route.
 *
 * @since v0.6.0 G4-SA
 */

import { AuthCard }          from '@/components/auth/AuthCard';
import { SocialAuthButtons } from '@/components/auth/SocialAuthButtons';
import { LoginForm }         from './LoginForm';

interface PageProps {
  searchParams: {
    redirectTo?: string;
    error?:      string;
    message?:    string;
  };
}

export default function LoginPage({ searchParams }: PageProps) {
  const { redirectTo = '/workspace', error, message } = searchParams;

  return (
    <AuthCard
      title="Welcome back"
      subtitle="Sign in to your cognitive operating system."
    >
      <div className="flex flex-col gap-6">
        {/* OAuth */}
        <SocialAuthButtons redirectTo={redirectTo} />

        {/* Divider */}
        <div className="flex items-center gap-3">
          <div className="flex-1 border-t" style={{ borderColor: 'var(--color-border)' }} />
          <span className="text-xs" style={{ color: 'var(--color-muted)' }}>or</span>
          <div className="flex-1 border-t" style={{ borderColor: 'var(--color-border)' }} />
        </div>

        {/* Email form */}
        <LoginForm
          redirectTo={redirectTo}
          error={error}
          message={message}
        />
      </div>
    </AuthCard>
  );
}
