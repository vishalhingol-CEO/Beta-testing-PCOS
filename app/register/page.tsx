/**
 * Register Page
 * ==============
 * @since v0.6.0 G4-SA
 */

import { AuthCard }          from '@/components/auth/AuthCard';
import { SocialAuthButtons } from '@/components/auth/SocialAuthButtons';
import { RegisterForm }      from './RegisterForm';

export default function RegisterPage() {
  return (
    <AuthCard
      title="Create your account"
      subtitle="Your cognitive operating system awaits."
    >
      <div className="flex flex-col gap-6">
        <SocialAuthButtons />

        <div className="flex items-center gap-3">
          <div className="flex-1 border-t" style={{ borderColor: 'var(--color-border)' }} />
          <span className="text-xs" style={{ color: 'var(--color-muted)' }}>or</span>
          <div className="flex-1 border-t" style={{ borderColor: 'var(--color-border)' }} />
        </div>

        <RegisterForm />
      </div>
    </AuthCard>
  );
}
