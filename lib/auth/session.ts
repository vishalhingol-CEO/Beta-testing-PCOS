/**
 * PCOS Server-Side Session Utilities
 * ====================================
 * Provides getServerSession() for Server Components and API routes.
 *
 * SECURITY RULES (per PCOS_SECURITY_IDENTITY_FOUNDATION_v1.0.md):
 * - Never exposes tokens to client-side code
 * - user_id is always derived from the validated JWT, never from request params
 * - ES-SEC-03: JWT validation is the first operation in every authenticated context
 * - ES-SEC-06: Service role key is server-only
 *
 * Usage (Server Component):
 *   const session = await getServerSession();
 *   // Redirects to /login automatically if not authenticated
 *
 * Usage (API Route — throws, does not redirect):
 *   const session = await getApiSession(request);
 *   if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 });
 *
 * @since v0.6.0 G4-SA
 */

import { createServerClient } from '@supabase/ssr';
import { cookies }            from 'next/headers';
import { redirect }           from 'next/navigation';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export interface UserProfile {
  displayName: string;
  avatarUrl:   string | null;
  plan:        'free' | 'pro' | 'team' | 'enterprise';
  onboarded:   boolean;
}

export interface ServerSession {
  /** Authenticated user UUID — always from validated JWT, never from request params */
  userId:  string;
  email:   string;
  profile: UserProfile | null;
}

// ─────────────────────────────────────────────────────────────────────────────
// Server-side Supabase client (cookie-based)
// For use in Server Components only. Uses the anon key — RLS enforces isolation.
// ─────────────────────────────────────────────────────────────────────────────

function createCookieClient() {
  const cookieStore = cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: () => {
          // Read-only in Server Components — cookies set by middleware
        },
      },
    },
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// getServerSession — for Server Components
// Redirects to /login if not authenticated. Never throws.
// ─────────────────────────────────────────────────────────────────────────────

export async function getServerSession(): Promise<ServerSession> {
  const supabase = createCookieClient();

  // ES-SEC-03: Identity validation is always first
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    redirect('/login');
  }

  // Fetch profile (created automatically by trigger on registration)
  const { data: profile } = await supabase
    .from('profiles')
    .select('display_name, avatar_url, plan, onboarded_at')
    .eq('user_id', user.id)
    .single();

  return {
    userId: user.id,
    email:  user.email ?? '',
    profile: profile ? {
      displayName: profile.display_name || user.email?.split('@')[0] || 'User',
      avatarUrl:   profile.avatar_url   ?? null,
      plan:        (profile.plan as UserProfile['plan']) || 'free',
      onboarded:   profile.onboarded_at !== null,
    } : null,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// getApiSession — for API Routes
// Returns null instead of redirecting. Callers return 401.
// ─────────────────────────────────────────────────────────────────────────────

export async function getApiSession(): Promise<{ userId: string; email: string } | null> {
  try {
    const supabase = createCookieClient();

    // ES-SEC-03: getUser() validates the JWT server-side (not just decodes it)
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user) return null;

    return {
      userId: user.id,
      email:  user.email ?? '',
    };
  } catch {
    return null;
  }
}

// Browser client: see lib/auth/browser-client.ts (client-safe module)
