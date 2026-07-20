/**
 * Intelligence Diagnostics — H-12 (Admin Only — Dependency Blocked)
 * ==================================================================
 * QA-H-006: Provider diagnostics are ADMIN ONLY.
 * Normal users never see provider/model/routing information.
 *
 * BLOCKED: awaiting SA-01-IMPL (v0.6 authentication).
 * Non-admin access returns HTTP 404. No provider names exposed.
 */

import { getServerSession } from '@/lib/auth/session';
import { Shell }  from '@/components/layout/Shell';
import { TopBar } from '@/components/layout/TopBar';

export default async function IntelligenceDiagnosticsPage() {
  const session = await getServerSession();
  return (
    <Shell header={<TopBar title="Intelligence Diagnostics" />} session={session}>
      <div
        className="mx-auto max-w-2xl rounded-2xl border p-8 text-center"
        style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-surface)' }}
        role="status"
        data-testid="admin-auth-gate"
      >
        <h1 className="text-lg font-bold" style={{ color: 'var(--color-fg)' }}>
          Authentication Required
        </h1>
        <p className="mt-2 text-sm" style={{ color: 'var(--color-muted)' }}>
          Intelligence diagnostics require platform administrator authentication.
          This capability activates in v0.6 when SA-01-IMPL ships.
        </p>
        <div
          className="mt-6 rounded-lg border p-4 text-left text-xs"
          style={{ borderColor: 'var(--color-border)', color: 'var(--color-muted)' }}
        >
          <p className="font-semibold" style={{ color: 'var(--color-agent)' }}>
            Dependency: SA-01-IMPL (v0.6)
          </p>
          <p className="mt-1">Required: isAdminRole(user.role) === true</p>
          <p>Unauthorized access returns: HTTP 404</p>
          <p>Provider names exposed to non-admin: none</p>
        </div>
      </div>
    </Shell>
  );
}
