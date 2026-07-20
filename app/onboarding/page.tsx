/**
 * Onboarding Page
 * ================
 * Auth guard: redirects to /login if not authenticated.
 * Redirects to /workspace if already onboarded.
 *
 * @since v0.6.0 G4-SA
 */

import { redirect }        from 'next/navigation';
import { AuthCard }        from '@/components/auth/AuthCard';
import { OnboardingFlow }  from './OnboardingFlow';
import { getServerSession } from '@/lib/auth/session';

export default async function OnboardingPage() {
  const session = await getServerSession();

  // Already completed onboarding → go to workspace
  if (session.profile?.onboarded) {
    redirect('/workspace');
  }

  return (
    <AuthCard title="">
      <OnboardingFlow
        userId={session.userId}
        displayName={session.profile?.displayName ?? session.email.split('@')[0]}
      />
    </AuthCard>
  );
}
