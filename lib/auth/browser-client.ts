/**
 * PCOS Browser-Side Supabase Client
 * ====================================
 * Client-safe module for use in Client Components ('use client').
 * Does NOT import next/headers — safe to bundle into client JS.
 *
 * Server-side session utilities are in lib/auth/session.ts.
 * Do NOT import session.ts in Client Components.
 *
 * @since v0.6.0 G4-SA
 */

import { createBrowserClient as createBrowserClientSSR } from '@supabase/ssr';

/**
 * Creates a Supabase browser client for Client Components.
 * Uses anon key only — RLS enforces data isolation.
 * Session cookies are managed automatically by @supabase/ssr.
 */
export function createBrowserClient() {
  return createBrowserClientSSR(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
