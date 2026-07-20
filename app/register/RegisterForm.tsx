/**
 * RegisterForm — New User Registration
 * ======================================
 * Fields: display name, email, password, confirm password.
 * On success: redirects to /verify-email.
 *
 * @since v0.6.0 G4-SA
 */

'use client';

import { useState, useCallback } from 'react';
import { useRouter }             from 'next/navigation';
import Link                      from 'next/link';
import { createBrowserClient }   from '@/lib/auth/browser-client';

export function RegisterForm() {
  const router = useRouter();
  const [displayName,  setDisplayName]  = useState('');
  const [email,        setEmail]        = useState('');
  const [password,     setPassword]     = useState('');
  const [confirmPw,    setConfirmPw]    = useState('');
  const [loading,      setLoading]      = useState(false);
  const [error,        setError]        = useState<string | null>(null);
  const [fieldErrors,  setFieldErrors]  = useState<Record<string, string>>({});

  const handleRegister = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();

    // Inline validation — avoids useCallback dependency on validate
    const errors: Record<string, string> = {};
    if (!displayName.trim())    errors.displayName = 'Display name is required.';
    if (!email.trim())          errors.email       = 'Email is required.';
    if (password.length < 8)    errors.password    = 'Password must be at least 8 characters.';
    if (password !== confirmPw) errors.confirmPw   = 'Passwords do not match.';
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setLoading(true);
    setError(null);

    try {
      const supabase = createBrowserClient();
      const { error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: displayName.trim(),
          },
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (signUpError) {
        if (signUpError.message.includes('already registered')) {
          setError('An account with this email already exists. Please sign in instead.');
        } else {
          setError('Could not create your account. Please try again.');
        }
        return;
      }

      // Supabase sends verification email — redirect to confirmation notice
      router.push('/verify-email?email=' + encodeURIComponent(email));
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [displayName, email, password, confirmPw, router]);

  return (
    <form
      onSubmit={handleRegister}
      className="flex flex-col gap-4"
      data-testid="register-form"
      noValidate
    >
      {error && (
        <div
          className="rounded-lg border px-4 py-3 text-sm"
          role="alert"
          data-testid="register-error"
          style={{
            borderColor:     'color-mix(in srgb, var(--color-danger) 30%, transparent)',
            backgroundColor: 'color-mix(in srgb, var(--color-danger) 8%, transparent)',
            color:            'var(--color-danger)',
          }}
        >
          {error}
        </div>
      )}

      {/* Display name */}
      <div className="flex flex-col gap-1.5">
        <label htmlFor="displayName" className="text-sm font-medium" style={{ color: 'var(--color-fg)' }}>
          Display name
        </label>
        <input
          id="displayName"
          type="text"
          value={displayName}
          onChange={e => setDisplayName(e.target.value)}
          autoComplete="name"
          autoFocus
          required
          data-testid="register-name-input"
          aria-required="true"
          aria-describedby={fieldErrors.displayName ? 'error-name' : undefined}
          className="w-full rounded-xl border bg-transparent px-4 py-3 text-sm placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-brand focus:ring-offset-2 focus:ring-offset-bg"
          style={{ borderColor: fieldErrors.displayName ? 'var(--color-danger)' : 'var(--color-border)', color: 'var(--color-fg)' }}
          placeholder="Vishal"
        />
        {fieldErrors.displayName && (
          <p id="error-name" className="text-xs" style={{ color: 'var(--color-danger)' }} role="alert">
            {fieldErrors.displayName}
          </p>
        )}
      </div>

      {/* Email */}
      <div className="flex flex-col gap-1.5">
        <label htmlFor="email" className="text-sm font-medium" style={{ color: 'var(--color-fg)' }}>
          Email
        </label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          autoComplete="email"
          required
          data-testid="register-email-input"
          aria-required="true"
          aria-describedby={fieldErrors.email ? 'error-email' : undefined}
          className="w-full rounded-xl border bg-transparent px-4 py-3 text-sm placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-brand focus:ring-offset-2 focus:ring-offset-bg"
          style={{ borderColor: fieldErrors.email ? 'var(--color-danger)' : 'var(--color-border)', color: 'var(--color-fg)' }}
          placeholder="you@example.com"
        />
        {fieldErrors.email && (
          <p id="error-email" className="text-xs" style={{ color: 'var(--color-danger)' }} role="alert">
            {fieldErrors.email}
          </p>
        )}
      </div>

      {/* Password */}
      <div className="flex flex-col gap-1.5">
        <label htmlFor="password" className="text-sm font-medium" style={{ color: 'var(--color-fg)' }}>
          Password
        </label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          autoComplete="new-password"
          required
          data-testid="register-password-input"
          aria-required="true"
          aria-describedby={fieldErrors.password ? 'error-password' : 'password-hint'}
          className="w-full rounded-xl border bg-transparent px-4 py-3 text-sm placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-brand focus:ring-offset-2 focus:ring-offset-bg"
          style={{ borderColor: fieldErrors.password ? 'var(--color-danger)' : 'var(--color-border)', color: 'var(--color-fg)' }}
          placeholder="At least 8 characters"
        />
        {fieldErrors.password
          ? <p id="error-password" className="text-xs" style={{ color: 'var(--color-danger)' }} role="alert">{fieldErrors.password}</p>
          : <p id="password-hint" className="text-xs" style={{ color: 'var(--color-muted)' }}>At least 8 characters</p>
        }
      </div>

      {/* Confirm password */}
      <div className="flex flex-col gap-1.5">
        <label htmlFor="confirmPw" className="text-sm font-medium" style={{ color: 'var(--color-fg)' }}>
          Confirm password
        </label>
        <input
          id="confirmPw"
          type="password"
          value={confirmPw}
          onChange={e => setConfirmPw(e.target.value)}
          autoComplete="new-password"
          required
          data-testid="register-confirm-input"
          aria-required="true"
          aria-describedby={fieldErrors.confirmPw ? 'error-confirm' : undefined}
          className="w-full rounded-xl border bg-transparent px-4 py-3 text-sm placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-brand focus:ring-offset-2 focus:ring-offset-bg"
          style={{ borderColor: fieldErrors.confirmPw ? 'var(--color-danger)' : 'var(--color-border)', color: 'var(--color-fg)' }}
          placeholder="••••••••"
        />
        {fieldErrors.confirmPw && (
          <p id="error-confirm" className="text-xs" style={{ color: 'var(--color-danger)' }} role="alert">
            {fieldErrors.confirmPw}
          </p>
        )}
      </div>

      <button
        type="submit"
        disabled={loading}
        data-testid="register-submit-btn"
        className="w-full rounded-xl py-3 text-sm font-semibold text-white transition-opacity duration-fast hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-bg"
        style={{ backgroundColor: 'var(--color-brand)' }}
      >
        {loading ? 'Creating account…' : 'Create account'}
      </button>

      <p className="text-center text-xs" style={{ color: 'var(--color-muted)' }}>
        Already have an account?{' '}
        <Link
          href="/login"
          className="font-medium hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand rounded"
          style={{ color: 'var(--color-brand)' }}
          data-testid="register-login-link"
        >
          Sign in
        </Link>
      </p>
    </form>
  );
}
