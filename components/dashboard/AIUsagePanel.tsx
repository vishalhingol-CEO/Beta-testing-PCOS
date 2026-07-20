/**
 * AIUsagePanel — H-07
 * ====================
 * Displays daily AI usage: cost, requests, token efficiency, memory hits.
 * Data source: GET /api/stats
 * Provider names: NEVER shown. Aggregate only.
 *
 * Warning thresholds: >80% amber, >95% red.
 *
 * @lifecycle Approved
 * @since v0.5.0 Phase H
 */

import { Zap } from 'lucide-react';
import type { PCOSStats } from '@/lib/api/stats';

interface UsageBarProps {
  value:   number;
  max:     number;
  label:   string;
  format?: (v: number) => string;
}

function UsageBar({ value, max, label, format }: UsageBarProps) {
  const pct     = max > 0 ? Math.min((value / max) * 100, 100) : 0;
  const isWarn  = pct > 80;
  const isDanger= pct > 95;

  const colour = isDanger
    ? 'var(--color-danger)'
    : isWarn
    ? 'var(--color-agent)'
    : 'var(--color-brand)';

  const display = format ? format(value) : String(value);
  const maxDisplay = format ? format(max) : String(max);

  return (
    <div className="flex flex-col gap-1" data-testid={`usage-bar-${label.toLowerCase().replace(/\s+/g, '-')}`}>
      <div className="flex items-center justify-between">
        <span className="text-xs" style={{ color: 'var(--color-muted)' }}>{label}</span>
        <span className="font-mono text-xs tabular-nums" style={{ color: 'var(--color-fg)' }}>
          {display}
          <span style={{ color: 'var(--color-muted)' }}> / {maxDisplay}</span>
        </span>
      </div>
      <div
        className="h-1.5 w-full overflow-hidden rounded-full"
        style={{ backgroundColor: 'var(--color-border)' }}
        role="meter"
        aria-label={`${label}: ${Math.round(pct)}%`}
        aria-valuenow={Math.round(pct)}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div
          className="h-1.5 rounded-full transition-all duration-slow"
          style={{ width: `${pct}%`, backgroundColor: colour }}
          aria-hidden="true"
        />
      </div>
    </div>
  );
}

interface AIUsagePanelProps {
  stats: PCOSStats;
}

export function AIUsagePanel({ stats }: AIUsagePanelProps) {
  const memHits  = stats.today_memory_hits ?? 0;
  const total    = stats.today_requests;
  const hitPct   = total > 0 ? Math.round((memHits / total) * 100) : 0;
  const saved    = stats.today_tokens_saved ?? 0;

  return (
    <div
      className="pcos-glass flex flex-col gap-4 rounded-xl p-4"
      data-testid="ai-usage-panel"
    >
      <div className="flex items-center gap-2">
        <Zap size={16} aria-hidden="true" style={{ color: 'var(--color-intelligence)' }} />
        <h2 className="text-sm font-semibold" style={{ color: 'var(--color-fg)' }}>
          Intelligence Usage
        </h2>
      </div>

      <div className="flex flex-col gap-3">
        <UsageBar
          value={stats.today_requests}
          max={stats.daily_request_limit}
          label="Requests today"
        />
        <UsageBar
          value={stats.today_cost_usd}
          max={stats.daily_cost_limit_usd}
          label="Cost today"
          format={v => `$${v.toFixed(4)}`}
        />
      </div>

      {/* Memory efficiency */}
      <div
        className="flex items-center justify-between rounded-lg px-3 py-2"
        style={{ backgroundColor: 'color-mix(in srgb, var(--color-memory) 8%, transparent)' }}
      >
        <span className="text-xs" style={{ color: 'var(--color-muted)' }}>
          Answered from memory
        </span>
        <span
          className="font-mono text-sm font-bold tabular-nums"
          style={{ color: 'var(--color-memory)' }}
          aria-label={`${hitPct}% of requests answered from memory`}
        >
          {hitPct}%
        </span>
      </div>

      {saved > 0 && (
        <p className="text-center text-xs" style={{ color: 'var(--color-muted)' }}>
          <span className="font-semibold" style={{ color: 'var(--color-success)' }}>
            {saved.toLocaleString()} tokens saved
          </span>{' '}
          today by memory recall
        </p>
      )}
    </div>
  );
}
