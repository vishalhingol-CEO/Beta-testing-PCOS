/**
 * OAuth Callback Handler
 * =======================
 * Exchanges the OAuth authorization code for a Supabase session.
 * Redirects to /onboarding (new user) or /workspace (returning user).
 *
 * Called by:
 * - Google OAuth redirect
 * - Magic link email click
 *
 * Security:
 * - Code exchange happens server-side — tokens never exposed to client JS
 * - redirectTo parameter is whitelisted to prevent open redirect attacks
 * - ES-SEC-07: No internal state leaked in error responses
 *
 * @since v0.6.0 G4-SA
 */

import { createServerClient } from '@supabase/ssr';
import { cookies }            from 'next/headers';
import { NextResponse, type NextRequest } from 'next/server';

/** Allowlist of valid post-auth redirect destinations (prevents open redirect) */
const ALLOWED_REDIRECT_DESTINATIONS = new Set([
  '/workspace',
  '/dashboard',
  '/memories',
  '/search',
  '/knowledge-graph',
  '/workflow',
  '/settings',
  '/profile',
]);

function isSafeRedirect(destination: string): boolean {
  // Must start with / (relative, not external)
  if (!destination.startsWith('/')) return false;
  // Must be in allowlist or start with an allowed prefix
  const base = '/' + destination.split('/')[1];
  return ALLOWED_REDIRECT_DESTINATIONS.has(base);
}

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code      = searchParams.get('code');
  const nextParam = searchParams.get('next');

  // Validate redirect destination (prevent open redirect)
  const redirectTo = nextParam && isSafeRedirect(nextParam) ? nextParam : '/workspace';

  if (!code) {
    // No code = invalid callback (direct navigation or expired link)
    return NextResponse.redirect(`${origin}/login?error=auth_callback_invalid`);
  }

  const cookieStore = cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        },
      },
    },
  );

  const { data, error } = await supabase.auth.exchangeCodeForSession(code);

  if (error || !data.session) {
    // ES-SEC-07: Error response reveals no internal state
    return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`);
  }

  // Check if user has completed onboarding
  const { data: profile } = await supabase
    .from('profiles')
    .select('onboarded_at')
    .eq('user_id', data.session.user.id)
    .single();

  // New user (no profile or not onboarded) → onboarding
  // Returning user → intended destination
  const destination = profile?.onboarded_at ? redirectTo : '/onboarding';

  return NextResponse.redirect(`${origin}${destination}`);
}
