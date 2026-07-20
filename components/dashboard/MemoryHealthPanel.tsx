/**
 * MemoryHealthPanel — H-08
 * =========================
 * Displays memory processing pipeline health.
 * Data source: GET /api/stats
 *
 * Colour: processed=success, processing=agent(amber), failed=danger.
 *
 * @lifecycle Approved
 * @since v0.5.0 Phase H
 */

import Link from 'next/link';
import { Brain, RefreshCcw } from 'lucide-react';
import type { PCOSStats } from '@/lib/api/stats';

interface MemoryHealthPanelProps {
  stats: PCOSStats;
}

interface RingSegment {
  label:  string;
  value:  number;
  colour: string;
}

/** Builds a simple SVG donut from segments. */
function DonutRing({ segments, total }: { segments: RingSegment[]; total: number }) {
  const r    = 36;
  const circ = 2 * Math.PI * r;
  let offset = 0;

  return (
    <svg width={88} height={88} viewBox="0 0 88 88" role="img" aria-label="Memory health ring">
      <circle cx={44} cy={44} r={r} fill="none" stroke="var(--color-border)" strokeWidth={8} />
      {segments.map((seg, i) => {
        const pct  = total > 0 ? seg.value / total : 0;
        const dash = pct * circ;
        const gap  = circ - dash;
        const el   = (
          <circle
            key={i}
            cx={44} cy={44} r={r}
            fill="none"
            stroke={seg.colour}
            strokeWidth={8}
            strokeDasharray={`${dash} ${gap}`}
            strokeDashoffset={-offset}
            strokeLinecap="round"
            transform="rotate(-90 44 44)"
          />
        );
        offset += dash;
        return el;
      })}
      {/* aria-hidden: total is announced via the panel heading, not repeated here */}
      <text x={44} y={48} textAnchor="middle" fontSize={16} fontWeight={700} fill="var(--color-fg)" aria-hidden="true">
        {total}
      </text>
    </svg>
  );
}

export function MemoryHealthPanel({ stats }: MemoryHealthPanelProps) {
  const total = stats.total_nodes;

  const segments: RingSegment[] = [
    { label: 'Processed',  value: stats.processed_nodes,  colour: 'var(--color-success)' },
    { label: 'Processing', value: stats.processing_nodes, colour: 'var(--color-agent)'   },
    { label: 'Failed',     value: stats.failed_nodes,     colour: 'var(--color-danger)'  },
  ];

  const pct = total > 0 ? Math.round((stats.processed_nodes / total) * 100) : 0;

  return (
    <div
      className="pcos-glass flex flex-col gap-4 rounded-xl p-4"
      data-testid="memory-health-panel"
    >
      <div className="flex items-center gap-2">
        <Brain size={16} aria-hidden="true" style={{ color: 'var(--color-memory)' }} />
        <h2 className="text-sm font-semibold" style={{ color: 'var(--color-fg)' }}>
          Memory Health
        </h2>
      </div>

      <div className="flex items-center gap-4">
        <DonutRing segments={segments} total={total} />

        <div className="flex flex-col gap-2">
          {segments.map(seg => (
            <div key={seg.label} className="flex items-center gap-2">
              <span
                className="h-2 w-2 flex-shrink-0 rounded-full"
                style={{ backgroundColor: seg.colour }}
                aria-hidden="true"
              />
              <span className="text-xs" style={{ color: 'var(--color-muted)' }}>
                {seg.label}
              </span>
              <span className="ml-auto font-mono text-xs font-medium tabular-nums"
                style={{ color: 'var(--color-fg)' }}>
                {seg.value}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between border-t pt-3"
        style={{ borderColor: 'var(--color-border)' }}>
        <span className="text-xs" style={{ color: 'var(--color-muted)' }}>
          {pct}% indexed
        </span>
        {stats.failed_nodes > 0 && (
          <Link
            href="/memories?status=failed"
            data-testid="memory-health-retry-link"
            className="flex items-center gap-1 rounded text-xs font-medium transition-colors duration-fast hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
            style={{ color: 'var(--color-danger)' }}
          >
            <RefreshCcw size={12} aria-hidden="true" />
            Retry {stats.failed_nodes} failed
          </Link>
        )}
      </div>
    </div>
  );
}
