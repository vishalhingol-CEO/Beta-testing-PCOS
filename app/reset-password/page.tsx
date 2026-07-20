/**
 * Reset Password Page
 * ====================
 * Sends a password reset email via Supabase Auth.
 * @since v0.6.0 G4-SA
 */
'use client';
import { useState } from 'react';
import { AuthCard } from '@/components/auth/AuthCard';
import Link         from 'next/link';
import { createBrowserClient } from '@/lib/auth/browser-client';

export default function ResetPasswordPage() {
  const [email,   setEmail]   = useState('');
  const [loading, setLoading] = useState(false);
  const [sent,    setSent]    = useState(false);
  const [error,   setError]   = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true); setError(null);
    try {
      const supabase = createBrowserClient();
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password/confirm`,
      });
      if (resetError) { setError('Could not send reset email. Please try again.'); return; }
      setSent(true);
    } catch { setError('Something went wrong. Please try again.'); }
    finally   { setLoading(false); }
  }

  if (sent) {
    return (
      <AuthCard title="Check your email">
        <p className="text-sm text-center" style={{ color: 'var(--color-muted)' }}>
          If an account exists for <strong style={{ color: 'var(--color-fg)' }}>{email}</strong>,
          a reset link has been sent.
        </p>
      </AuthCard>
    );
  }

  return (
    <AuthCard title="Reset your password" subtitle="We'll email you a reset link.">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4" data-testid="reset-password-form" noValidate>
        {error && (
          <p className="text-sm" style={{ color: 'var(--color-danger)' }} role="alert">{error}</p>
        )}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="email" className="text-sm font-medium" style={{ color: 'var(--color-fg)' }}>Email</label>
          <input
            id="email" type="email" value={email} onChange={e => setEmail(e.target.value)}
            autoComplete="email" autoFocus required data-testid="reset-email-input"
            className="w-full rounded-xl border bg-transparent px-4 py-3 text-sm placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-brand focus:ring-offset-2 focus:ring-offset-bg"
            style={{ borderColor: 'var(--color-border)', color: 'var(--color-fg)' }}
            placeholder="you@example.com"
          />
        </div>
        <button type="submit" disabled={loading || !email.trim()} data-testid="reset-submit-btn"
          className="w-full rounded-xl py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-bg"
          style={{ backgroundColor: 'var(--color-brand)' }}>
          {loading ? 'Sending…' : 'Send reset link'}
        </button>
        <p className="text-center text-xs" style={{ color: 'var(--color-muted)' }}>
          <Link href="/login" style={{ color: 'var(--color-brand)' }} className="hover:underline">Back to sign in</Link>
        </p>
      </form>
    </AuthCard>
  );
}
