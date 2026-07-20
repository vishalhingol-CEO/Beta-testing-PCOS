/**
 * PCOS Authentication Middleware
 * ================================
 * Runs on every request (except static assets).
 * Validates JWT via Supabase Auth session refresh.
 * Redirects unauthenticated users to /login.
 * Redirects authenticated users away from /login and /register.
 *
 * SECURITY:
 * - Uses @supabase/ssr for cookie-based session management
 * - Refreshes access token on every request (keeps session alive)
 * - Never reads JWT claims directly — delegates to Supabase Auth
 * - Preserves original destination in ?redirectTo for post-login redirect
 *
 * Per PCOS_SECURITY_IDENTITY_FOUNDATION_v1.0.md:
 * - ES-SEC-03: Identity validation before any data access
 * - ES-SEC-04: Authentication is the baseline for all features
 * - ES-SEC-12: Authentication applies in all environments
 *
 * @since v0.6.0 G4-SA
 */

import { NextResponse, type NextRequest } from 'next/server';
import { createMiddlewareClient, isPublicRoute, isAuthOnlyRoute } from '@/lib/auth/middleware-utils';

export async function middleware(request: NextRequest) {
  // Start with a pass-through response — session cookies are updated in-place
  let response = NextResponse.next({
    request: { headers: request.headers },
  });

  // Create Supabase client that refreshes session tokens and writes updated cookies
  const supabase = createMiddlewareClient(request, response);

  // Refresh session — REQUIRED on every request to keep access tokens fresh
  // getUser() validates the JWT server-side (not just a decode)
  const { data: { user } } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;

  // ── Public routes ──────────────────────────────────────────────────────────
  if (isPublicRoute(pathname)) {
    // Authenticated users navigating to /login or /register → send to /workspace
    if (user && isAuthOnlyRoute(pathname)) {
      return NextResponse.redirect(new URL('/workspace', request.url));
    }
    return response;
  }

  // ── Protected routes ───────────────────────────────────────────────────────
  if (!user) {
    // Preserve the destination for post-login redirect
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirectTo', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Authenticated — allow the request through
  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths EXCEPT:
     * - _next/static  (static files)
     * - _next/image   (image optimization files)
     * - favicon.ico
     * - Image files: .svg .png .jpg .jpeg .gif .webp
     * This prevents the middleware from firing on static asset requests,
     * which would add unnecessary latency.
     */
    '/((?!_next/static|_next/image|favicon\\.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
