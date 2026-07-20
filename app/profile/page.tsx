/**
 * Profile Page
 * =============
 * View and edit user profile (display name, plan display).
 * @since v0.6.0 G4-SA
 */

import { Shell }   from '@/components/layout/Shell';
import { TopBar }  from '@/components/layout/TopBar';
import { getServerSession } from '@/lib/auth/session';

export const dynamic    = 'force-dynamic';
export const revalidate = 0;

export default async function ProfilePage() {
  const session = await getServerSession();
  const profile = session.profile;

  return (
    <Shell
      header={<TopBar title="Profile" />}
      session={session}
    >
      <div className="mx-auto max-w-lg">
        <div
          className="pcos-glass flex flex-col gap-6 rounded-2xl p-6"
          data-testid="profile-card"
        >
          {/* Avatar + identity */}
          <div className="flex items-center gap-4">
            {profile?.avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={profile.avatarUrl}
                alt=""
                aria-hidden="true"
                className="h-14 w-14 rounded-full"
              />
            ) : (
              <div
                className="flex h-14 w-14 items-center justify-center rounded-full text-xl font-bold text-white"
                style={{ backgroundColor: 'var(--color-brand)' }}
                aria-hidden="true"
              >
                {(profile?.displayName?.[0] ?? session.email[0] ?? 'U').toUpperCase()}
              </div>
            )}
            <div>
              <p
                className="text-lg font-semibold"
                style={{ color: 'var(--color-fg)' }}
                data-testid="profile-display-name"
              >
                {profile?.displayName || '—'}
              </p>
              <p className="text-sm" style={{ color: 'var(--color-muted)' }}>
                {session.email}
              </p>
            </div>
          </div>

          {/* Plan badge */}
          <div
            className="flex items-center justify-between rounded-xl border px-4 py-3"
            style={{ borderColor: 'var(--color-border)' }}
          >
            <span className="text-sm" style={{ color: 'var(--color-muted)' }}>Plan</span>
            <span
              className="rounded-full px-3 py-1 text-xs font-semibold capitalize"
              style={{
                backgroundColor: 'color-mix(in srgb, var(--color-brand) 12%, transparent)',
                color:            'var(--color-brand)',
              }}
              data-testid="profile-plan"
            >
              {profile?.plan ?? 'free'}
            </span>
          </div>

          {/* Onboarding status */}
          <div
            className="flex items-center justify-between rounded-xl border px-4 py-3"
            style={{ borderColor: 'var(--color-border)' }}
          >
            <span className="text-sm" style={{ color: 'var(--color-muted)' }}>Account status</span>
            <span className="text-xs font-medium" style={{ color: 'var(--color-success)' }}>
              {profile?.onboarded ? 'Active' : 'Pending onboarding'}
            </span>
          </div>
        </div>
      </div>
    </Shell>
  );
}
