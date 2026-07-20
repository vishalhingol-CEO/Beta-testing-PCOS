/**
 * ProviderHealthDots — Intelligence Capability Health Indicator
 * ==============================================================
 * Traffic-light health dots. NEVER shows provider names.
 * QA-H-009: imports types from lib/types/provider-types.ts (not self-defined)
 *
 * @lifecycle Approved — QA-H-009 remediation
 * @since v0.5.0 Phase H
 */

import type { ProviderHealthRecord, ProviderHealthStatus } from '@/lib/types/provider-types';

// Re-export for consumers that imported from this file before the move
export type { ProviderHealthRecord, ProviderHealthStatus } from '@/lib/types/provider-types';

interface ProviderHealthDotsProps {
  providers:  ProviderHealthRecord[];
  size?:      'sm' | 'md';
  className?: string;
}

const STATUS_CONFIG: Record<ProviderHealthStatus, { colour: string; label: string }> = {
  healthy:   { colour: 'var(--color-success)', label: 'Capability available'       },
  degraded:  { colour: 'var(--color-agent)',   label: 'Capability degraded'        },
  unhealthy: { colour: 'var(--color-danger)',  label: 'Capability unavailable'     },
  unknown:   { colour: 'var(--color-muted)',   label: 'Capability status unknown'  },
};

export function ProviderHealthDots({
  providers,
  size      = 'md',
  className = '',
}: ProviderHealthDotsProps) {
  const dotSize = size === 'sm' ? 'h-2 w-2' : 'h-2.5 w-2.5';

  const overallHealthy = providers.every(p => p.status === 'healthy');
  const allUnhealthy   = providers.every(p => p.status === 'unhealthy');

  const summaryLabel = overallHealthy
    ? 'All intelligence capabilities available'
    : allUnhealthy
    ? 'Intelligence capabilities unavailable'
    : 'Some intelligence capabilities degraded';

  return (
    <div
      role="status"
      aria-label={summaryLabel}
      data-testid="provider-health-dots"
      className={`inline-flex items-center gap-1 ${className}`}
    >
      {providers.map((p, i) => {
        const config = STATUS_CONFIG[p.status];
        return (
          <span
            key={i}
            aria-label={config.label}
            title={config.label}
            className={`inline-block rounded-full flex-shrink-0 ${dotSize}`}
            style={{ backgroundColor: config.colour }}
          />
        );
      })}
    </div>
  );
}
