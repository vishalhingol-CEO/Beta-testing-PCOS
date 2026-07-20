/**
 * Workspace Page — Part 1 Scaffold
 * ==================================
 * Authenticated landing page for Part 1.
 * Full Thinking Workspace UI ships in Part 2 (G4-I + G4-J).
 *
 * This scaffold establishes:
 * - The route /workspace as the primary post-auth destination
 * - The session prop pattern for Shell
 * - The personalised greeting using the user's display name
 *
 * @since v0.6.0 G4-SA (scaffold)
 * @replaces v0.6.0 G4-I (full implementation in Part 2)
 */

import { Shell }            from '@/components/layout/Shell';
import { TopBar }           from '@/components/layout/TopBar';
import { getServerSession } from '@/lib/auth/session';

export const dynamic    = 'force-dynamic';
export const revalidate = 0;

function timeGreeting(): string {
  const hour = new Date().getUTCHours();  // Server renders in UTC
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

export default async function WorkspacePage() {
  const session = await getServerSession();
  const name    = session.profile?.displayName || session.email.split('@')[0];
  const greeting = timeGreeting();

  return (
    <Shell
      header={<TopBar title="Workspace" />}
      session={session}
    >
      <div
        className="flex flex-col items-center justify-center min-h-[60vh] text-center gap-6"
        data-testid="workspace-scaffold"
      >
        {/* Intelligence orb placeholder */}
        <div
          className="h-20 w-20 rounded-full flex items-center justify-center"
          style={{
            background: 'radial-gradient(circle at 35% 35%, color-mix(in srgb, var(--color-brand) 90%, white), var(--color-brand))',
            boxShadow:  '0 0 40px color-mix(in srgb, var(--color-brand) 30%, transparent)',
          }}
          aria-hidden="true"
        />

        <div>
          <h1
            className="text-2xl font-bold"
            style={{ color: 'var(--color-fg)' }}
            data-testid="workspace-greeting"
          >
            {greeting}, {name}.
          </h1>
          <p
            className="mt-2 text-sm"
            style={{ color: 'var(--color-muted)' }}
          >
            Your cognitive operating system is ready.
          </p>
        </div>

        <div
          className="pcos-glass rounded-2xl px-8 py-5 max-w-md w-full"
          style={{ borderColor: 'var(--color-border)' }}
        >
          <p className="text-sm font-medium" style={{ color: 'var(--color-muted)' }}>
            Thinking Workspace
          </p>
          <p className="mt-1 text-xs" style={{ color: 'var(--color-muted)' }}>
            The Universal Intelligence Interface arrives in Part 2.
            For now, use the navigation to explore your memories.
          </p>
        </div>
      </div>
    </Shell>
  );
}
