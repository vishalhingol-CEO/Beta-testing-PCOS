/**
 * OnboardingFlow — First-Run Multi-Step Experience
 * ==================================================
 * 4 steps: Welcome → Confirm Name → First Memory (optional) → Done
 * On completion: sets profiles.onboarded_at and redirects to /workspace.
 *
 * Design: minimal, calm. This is the first meaningful impression of PCOS.
 * Every word matters.
 *
 * @since v0.6.0 G4-SA
 */

'use client';

import { useState, useCallback } from 'react';
import { useRouter }             from 'next/navigation';
import Link                      from 'next/link';
import { createBrowserClient }   from '@/lib/auth/browser-client';

interface OnboardingFlowProps {
  userId:      string;
  displayName: string;
}

type OnboardingStep = 'welcome' | 'name' | 'memory' | 'done';

export function OnboardingFlow({ userId, displayName: initialName }: OnboardingFlowProps) {
  const router      = useRouter();
  const [step,      setStep]      = useState<OnboardingStep>('welcome');
  const [name,      setName]      = useState(initialName);
  const [loading,   setLoading]   = useState(false);
  const [error,     setError]     = useState<string | null>(null);

  const completeOnboarding = useCallback(async (finalName: string) => {
    setLoading(true);
    setError(null);

    try {
      const supabase = createBrowserClient();

      // Save display name + mark onboarded
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          display_name: finalName.trim() || initialName,
          onboarded_at: new Date().toISOString(),
        })
        .eq('user_id', userId);

      if (updateError) {
        setError('Could not complete setup. Please try again.');
        return;
      }

      setStep('done');
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [userId, initialName]);

  // ── Step: Welcome ──────────────────────────────────────────────────────────
  if (step === 'welcome') {
    return (
      <div className="flex flex-col gap-8 text-center" data-testid="onboarding-welcome">
        <div>
          <div className="mb-4 text-5xl" aria-hidden="true">🧠</div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--color-fg)' }}>
            Your cognitive operating system is ready.
          </h1>
          <p className="mt-3 text-sm leading-relaxed" style={{ color: 'var(--color-muted)' }}>
            PCOS remembers what matters, thinks before it speaks, and gets smarter every time you use it.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setStep('name')}
          data-testid="onboarding-welcome-next"
          className="
            mx-auto rounded-xl px-8 py-3 text-sm font-semibold text-white
            transition-opacity hover:opacity-90
            focus-visible:outline-none focus-visible:ring-2
            focus-visible:ring-brand focus-visible:ring-offset-2
            focus-visible:ring-offset-bg
          "
          style={{ backgroundColor: 'var(--color-brand)' }}
        >
          Get started →
        </button>
      </div>
    );
  }

  // ── Step: Confirm Name ─────────────────────────────────────────────────────
  if (step === 'name') {
    return (
      <form
        onSubmit={e => { e.preventDefault(); completeOnboarding(name); }}
        className="flex flex-col gap-6"
        data-testid="onboarding-name"
        noValidate
      >
        <div className="text-center">
          <h2 className="text-xl font-bold" style={{ color: 'var(--color-fg)' }}>
            What should PCOS call you?
          </h2>
          <p className="mt-2 text-sm" style={{ color: 'var(--color-muted)' }}>
            This appears in your personalised greeting each time you open PCOS.
          </p>
        </div>

        {error && (
          <p className="text-center text-sm" style={{ color: 'var(--color-danger)' }} role="alert">
            {error}
          </p>
        )}

        <div className="flex flex-col gap-2">
          <label htmlFor="display-name" className="text-sm font-medium" style={{ color: 'var(--color-fg)' }}>
            Display name
          </label>
          <input
            id="display-name"
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            autoFocus
            autoComplete="given-name"
            data-testid="onboarding-name-input"
            placeholder="Vishal"
            className="
              w-full rounded-xl border bg-transparent px-4 py-3 text-sm
              placeholder:text-muted
              focus:outline-none focus:ring-2 focus:ring-brand
              focus:ring-offset-2 focus:ring-offset-bg
            "
            style={{ borderColor: 'var(--color-border)', color: 'var(--color-fg)' }}
          />
        </div>

        <div className="flex flex-col gap-2">
          <button
            type="submit"
            disabled={loading}
            data-testid="onboarding-name-next"
            className="
              w-full rounded-xl py-3 text-sm font-semibold text-white
              transition-opacity hover:opacity-90 disabled:opacity-50
              focus-visible:outline-none focus-visible:ring-2
              focus-visible:ring-brand focus-visible:ring-offset-2
              focus-visible:ring-offset-bg
            "
            style={{ backgroundColor: 'var(--color-brand)' }}
          >
            {loading ? 'Setting up…' : 'Continue →'}
          </button>
        </div>
      </form>
    );
  }

  // ── Step: Done ─────────────────────────────────────────────────────────────
  if (step === 'done') {
    return (
      <div className="flex flex-col gap-8 text-center" data-testid="onboarding-done">
        <div>
          <div className="mb-4 text-5xl" aria-hidden="true">✨</div>
          <h2 className="text-2xl font-bold" style={{ color: 'var(--color-fg)' }}>
            PCOS is ready, {name || "let's go"}.
          </h2>
          <p className="mt-3 text-sm" style={{ color: 'var(--color-muted)' }}>
            Start by capturing a thought, or explore the dashboard.
          </p>
        </div>

        <div className="flex flex-col gap-3">
          <button
            type="button"
            onClick={() => router.push('/workspace')}
            data-testid="onboarding-go-workspace"
            className="
              w-full rounded-xl py-3 text-sm font-semibold text-white
              transition-opacity hover:opacity-90
              focus-visible:outline-none focus-visible:ring-2
              focus-visible:ring-brand focus-visible:ring-offset-2
              focus-visible:ring-offset-bg
            "
            style={{ backgroundColor: 'var(--color-brand)' }}
          >
            Open my workspace →
          </button>

          <Link
            href="/memories/new"
            data-testid="onboarding-go-capture"
            className="
              w-full rounded-xl border py-3 text-center text-sm font-medium
              transition-colors hover:bg-surface-hover
              focus-visible:outline-none focus-visible:ring-2
              focus-visible:ring-brand
            "
            style={{ borderColor: 'var(--color-border)', color: 'var(--color-muted)' }}
          >
            Capture my first memory
          </Link>
        </div>
      </div>
    );
  }

  return null;
}
