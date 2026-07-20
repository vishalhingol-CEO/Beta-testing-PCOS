/**
 * LoginForm — Email/Password + Magic Link Authentication
 * ========================================================
 * Client Component: manages form state and Supabase Auth calls.
 *
 * Modes:
 * - 'password' (default): email + password fields
 * - 'magic'              : email-only, sends magic link
 *
 * Security:
 * - Error messages are user-friendly; no internal state exposed (ES-SEC-07)
 * - Passwords are never logged or stored by the application
 * - After successful auth, profile.onboarded_at determines destination
 *
 * @since v0.6.0 G4-SA
 */

'use client';

import { useState, useCallback } from 'react';
import { useRouter }             from 'next/navigation';
import Link                      from 'next/link';
import { createBrowserClient }   from '@/lib/auth/browser-client';

interface LoginFormProps {
  redirectTo?: string;
  error?:      string;
  message?:    string;
}

/** User-facing error messages — never expose internal state (ES-SEC-07) */
const ERROR_MESSAGES: Record<string, string> = {
  email_not_confirmed:    'Please verify your email address before signing in.',
  invalid_credentials:    'Incorrect email or password.',
  auth_callback_failed:   'Something went wrong. Please try again.',
  auth_callback_invalid:  'This link is invalid or has expired. Please request a new one.',
  rate_limit:             'Too many attempts. Please wait a moment before trying again.',
};

function getErrorMessage(code: string | undefined): string {
  if (!code) return '';
  return ERROR_MESSAGES[code] ?? 'Something went wrong. Please try again.';
}

export function LoginForm({ redirectTo = '/workspace', error: errorCode, message }: LoginFormProps) {
  const router  = useRouter();
  const [mode,       setMode]       = useState<'password' | 'magic'>('password');
  const [email,      setEmail]      = useState('');
  const [password,   setPassword]   = useState('');
  const [loading,    setLoading]    = useState(false);
  const [formError,  setFormError]  = useState<string | null>(null);
  const [magicSent,  setMagicSent]  = useState(false);

  const serverError = getErrorMessage(errorCode);

  const handlePasswordLogin = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) return;

    setLoading(true);
    setFormError(null);

    try {
      const supabase = createBrowserClient();
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });

      if (error) {
        setFormError(
          error.message.includes('Invalid login credentials')
            ? ERROR_MESSAGES.invalid_credentials
            : error.message.includes('Email not confirmed')
            ? ERROR_MESSAGES.email_not_confirmed
            : ERROR_MESSAGES.auth_callback_failed
        );
        return;
      }

      if (data.session) {
        // Check onboarding status
        const { data: profile } = await supabase
          .from('profiles')
          .select('onboarded_at')
          .eq('user_id', data.session.user.id)
          .single();

        router.push(profile?.onboarded_at ? redirectTo : '/onboarding');
        router.refresh();
      }
    } catch {
      setFormError(ERROR_MESSAGES.auth_callback_failed);
    } finally {
      setLoading(false);
    }
  }, [email, password, redirectTo, router]);

  const handleMagicLink = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setLoading(true);
    setFormError(null);

    try {
      const supabase = createBrowserClient();
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(redirectTo)}`,
          shouldCreateUser: false,  // Magic link for existing users only; new users use /register
        },
      });

      if (error) {
        setFormError(error.message.includes('rate')
          ? ERROR_MESSAGES.rate_limit
          : ERROR_MESSAGES.auth_callback_failed
        );
        return;
      }

      setMagicSent(true);
    } catch {
      setFormError(ERROR_MESSAGES.auth_callback_failed);
    } finally {
      setLoading(false);
    }
  }, [email, redirectTo]);

  if (magicSent) {
    return (
      <div
        className="rounded-xl border p-4 text-center text-sm"
        style={{
          borderColor:     'color-mix(in srgb, var(--color-success) 30%, transparent)',
          backgroundColor: 'color-mix(in srgb, var(--color-success) 8%, transparent)',
          color:            'var(--color-success)',
        }}
        role="status"
        data-testid="magic-link-sent"
      >
        Magic link sent to <strong>{email}</strong>. Check your inbox.
      </div>
    );
  }

  return (
    <form
      onSubmit={mode === 'password' ? handlePasswordLogin : handleMagicLink}
      className="flex flex-col gap-4"
      data-testid="login-form"
      noValidate
    >
      {/* Server-side error (from URL param) */}
      {serverError && (
        <div
          className="rounded-lg border px-4 py-3 text-sm"
          role="alert"
          data-testid="login-server-error"
          style={{
            borderColor:     'color-mix(in srgb, var(--color-danger) 30%, transparent)',
            backgroundColor: 'color-mix(in srgb, var(--color-danger) 8%, transparent)',
            color:            'var(--color-danger)',
          }}
        >
          {serverError}
        </div>
      )}

      {/* Success message (e.g. "check your email") */}
      {message && (
        <div
          className="rounded-lg border px-4 py-3 text-sm"
          role="status"
          data-testid="login-message"
          style={{
            borderColor:     'color-mix(in srgb, var(--color-success) 30%, transparent)',
            backgroundColor: 'color-mix(in srgb, var(--color-success) 8%, transparent)',
            color:            'var(--color-success)',
          }}
        >
          {message}
        </div>
      )}

      {/* Email field */}
      <div className="flex flex-col gap-1.5">
        <label
          htmlFor="email"
          className="text-sm font-medium"
          style={{ color: 'var(--color-fg)' }}
        >
          Email
        </label>
        <input
          id="email"
          type="email"
          name="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          autoComplete="email"
          autoFocus
          required
          data-testid="login-email-input"
          aria-required="true"
          aria-describedby={formError ? 'login-form-error' : undefined}
          className="
            w-full rounded-xl border bg-transparent px-4 py-3 text-sm
            placeholder:text-muted
            focus:outline-none focus:ring-2 focus:ring-brand focus:ring-offset-2
            focus:ring-offset-bg
          "
          style={{ borderColor: 'var(--color-border)', color: 'var(--color-fg)' }}
          placeholder="you@example.com"
        />
      </div>

      {/* Password field (password mode only) */}
      {mode === 'password' && (
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <label
              htmlFor="password"
              className="text-sm font-medium"
              style={{ color: 'var(--color-fg)' }}
            >
              Password
            </label>
            <Link
              href="/reset-password"
              className="text-xs hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand rounded"
              style={{ color: 'var(--color-brand)' }}
            >
              Forgot password?
            </Link>
          </div>
          <input
            id="password"
            type="password"
            name="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            autoComplete="current-password"
            required
            data-testid="login-password-input"
            aria-required="true"
            className="
              w-full rounded-xl border bg-transparent px-4 py-3 text-sm
              placeholder:text-muted
              focus:outline-none focus:ring-2 focus:ring-brand focus:ring-offset-2
              focus:ring-offset-bg
            "
            style={{ borderColor: 'var(--color-border)', color: 'var(--color-fg)' }}
            placeholder="••••••••"
          />
        </div>
      )}

      {/* Client-side form error */}
      {formError && (
        <p
          id="login-form-error"
          className="text-sm"
          style={{ color: 'var(--color-danger)' }}
          role="alert"
          data-testid="login-form-error"
        >
          {formError}
        </p>
      )}

      {/* Submit button */}
      <button
        type="submit"
        disabled={loading || !email.trim() || (mode === 'password' && !password)}
        data-testid="login-submit-btn"
        className="
          w-full rounded-xl py-3 text-sm font-semibold text-white
          transition-opacity duration-fast hover:opacity-90
          disabled:cursor-not-allowed disabled:opacity-50
          focus-visible:outline-none focus-visible:ring-2
          focus-visible:ring-brand focus-visible:ring-offset-2
          focus-visible:ring-offset-bg
        "
        style={{ backgroundColor: 'var(--color-brand)' }}
      >
        {loading
          ? 'Signing in…'
          : mode === 'password'
          ? 'Sign in'
          : 'Send magic link'
        }
      </button>

      {/* Mode toggle + registration link */}
      <div className="flex flex-col gap-2 text-center">
        <button
          type="button"
          onClick={() => { setMode(m => m === 'password' ? 'magic' : 'password'); setFormError(null); }}
          data-testid="login-mode-toggle"
          className="text-xs hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand rounded"
          style={{ color: 'var(--color-muted)' }}
        >
          {mode === 'password' ? 'Use magic link instead' : 'Use password instead'}
        </button>
        <p className="text-xs" style={{ color: 'var(--color-muted)' }}>
          No account?{' '}
          <Link
            href="/register"
            className="font-medium hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand rounded"
            style={{ color: 'var(--color-brand)' }}
            data-testid="login-register-link"
          >
            Create one
          </Link>
        </p>
      </div>
    </form>
  );
}
