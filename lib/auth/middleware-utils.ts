/**
 * Middleware Authentication Utilities
 * =====================================
 * Creates a Supabase client suitable for Next.js middleware.
 * Middleware runs in the Edge runtime — cannot use Node.js APIs.
 *
 * @since v0.6.0 G4-SA
 */

import { createServerClient } from '@supabase/ssr';
import { type NextRequest, type NextResponse } from 'next/server';

/**
 * Creates a Supabase client for use in middleware.
 * Reads cookies from the request and writes updated cookies to the response.
 * Required for session refresh on every request.
 */
export function createMiddlewareClient(request: NextRequest, response: NextResponse) {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (cookiesToSet) => {
          // Write to both request and response — required for session refresh
          cookiesToSet.forEach(({ name, value }) => {
            request.cookies.set(name, value);
          });
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });
        },
      },
    },
  );
}

/** Routes that do not require authentication */
export const PUBLIC_ROUTES = new Set([
  '/',
  '/login',
  '/register',
  '/verify-email',
  '/reset-password',
  '/reset-password/confirm',
  '/auth/callback',
]);

/** Returns true if the given pathname is a public (non-authenticated) route */
export function isPublicRoute(pathname: string): boolean {
  return PUBLIC_ROUTES.has(pathname);
}

/** Routes that authenticated users should be redirected away from */
export const AUTH_ONLY_ROUTES = new Set(['/login', '/register']);

/** Returns true if authenticated users should be redirected away from this route */
export function isAuthOnlyRoute(pathname: string): boolean {
  return AUTH_ONLY_ROUTES.has(pathname);
}
