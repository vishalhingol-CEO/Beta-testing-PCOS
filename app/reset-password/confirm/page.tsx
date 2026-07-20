/**
 * Reset Password Confirm Page
 * ============================
 * Landed via the reset link from email. Collects new password.
 * @since v0.6.0 G4-SA
 */
'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AuthCard }  from '@/components/auth/AuthCard';
import { createBrowserClient } from '@/lib/auth/browser-client';

export default function ResetPasswordConfirmPage() {
  const router = useRouter();
  const [password,  setPassword]  = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [loading,   setLoading]   = useState(false);
  const [error,     setError]     = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password.length < 8)        { setError('Password must be at least 8 characters.'); return; }
    if (password !== confirmPw)     { setError('Passwords do not match.');                 return; }
    setLoading(true); setError(null);
    try {
      const supabase = createBrowserClient();
      const { error: updateError } = await supabase.auth.updateUser({ password });
      if (updateError) { setError('Could not update password. The link may have expired.'); return; }
      router.push('/login?message=Password updated. Please sign in.');
    } catch { setError('Something went wrong. Please try again.'); }
    finally   { setLoading(false); }
  }

  return (
    <AuthCard title="Set new password">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4" data-testid="reset-confirm-form" noValidate>
        {error && <p className="text-sm" style={{ color: 'var(--color-danger)' }} role="alert">{error}</p>}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="password" className="text-sm font-medium" style={{ color: 'var(--color-fg)' }}>New password</label>
          <input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)}
            autoComplete="new-password" autoFocus required data-testid="new-password-input"
            className="w-full rounded-xl border bg-transparent px-4 py-3 text-sm placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-brand focus:ring-offset-2 focus:ring-offset-bg"
            style={{ borderColor: 'var(--color-border)', color: 'var(--color-fg)' }} placeholder="At least 8 characters" />
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="confirmPw" className="text-sm font-medium" style={{ color: 'var(--color-fg)' }}>Confirm password</label>
          <input id="confirmPw" type="password" value={confirmPw} onChange={e => setConfirmPw(e.target.value)}
            autoComplete="new-password" required data-testid="confirm-password-input"
            className="w-full rounded-xl border bg-transparent px-4 py-3 text-sm placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-brand focus:ring-offset-2 focus:ring-offset-bg"
            style={{ borderColor: 'var(--color-border)', color: 'var(--color-fg)' }} placeholder="••••••••" />
        </div>
        <button type="submit" disabled={loading} data-testid="reset-confirm-btn"
          className="w-full rounded-xl py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-bg"
          style={{ backgroundColor: 'var(--color-brand)' }}>
          {loading ? 'Updating…' : 'Update password'}
        </button>
      </form>
    </AuthCard>
  );
}
