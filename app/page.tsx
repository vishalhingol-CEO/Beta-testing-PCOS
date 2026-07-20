/**
 * Root page — smart redirect
 * Authenticated users go to /workspace.
 * Unauthenticated users go to /login.
 * Middleware handles the /login redirect for protected routes,
 * but this explicit check handles the root "/" case.
 *
 * @since v0.5.0 (redirect to /dashboard)
 * @updated v0.6.0 G4-SA (redirects to /workspace for authenticated users)
 */
import { redirect } from 'next/navigation';
import { getApiSession } from '@/lib/auth/session';

export default async function RootPage() {
  const session = await getApiSession();
  redirect(session ? '/workspace' : '/login');
}
