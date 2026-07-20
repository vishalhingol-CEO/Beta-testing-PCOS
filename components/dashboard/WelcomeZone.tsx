/**
 * WelcomeZone — Time-aware dashboard greeting
 * =============================================
 * Client component: reads browser time for greeting copy.
 * No username in v0.5.0 — greeting is time-only.
 * Name slot reserved for v0.6.
 *
 * @lifecycle Approved
 * @since v0.5.0 Phase H
 */

'use client';
// Reason: reads Date() at render time for time-aware greeting

import { useMemo } from 'react';

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning.';
  if (hour < 17) return 'Good afternoon.';
  return 'Good evening.';
}

interface WelcomeZoneProps {
  totalMemories: number;
}

export function WelcomeZone({ totalMemories }: WelcomeZoneProps) {
  const greeting = useMemo(getGreeting, []);

  return (
    <div className="flex items-end justify-between" data-testid="welcome-zone">
      <div>
        <h1 className="text-2xl font-bold tracking-tight" style={{ color: 'var(--color-fg)' }}>
          {greeting}
        </h1>
        <p className="mt-1 text-sm" style={{ color: 'var(--color-muted)' }}>
          Your mind is your greatest asset.
        </p>
      </div>
      {totalMemories > 0 && (
        <p className="text-sm tabular-nums" style={{ color: 'var(--color-muted)' }}>
          <span className="font-semibold" style={{ color: 'var(--color-fg)' }}>
            {totalMemories.toLocaleString()}
          </span>{' '}
          {totalMemories === 1 ? 'memory' : 'memories'}
        </p>
      )}
    </div>
  );
}
