/**
 * MemoryTimeline — Dashboard Right Panel
 * ========================================
 * Chronological log of recent memories.
 * Data: GET /api/memories?limit=8&sort=created_at:desc
 * Each entry: coloured left border by processing status + timestamp.
 *
 * @lifecycle Approved
 * @since v0.5.0 Phase H
 */

import Link from 'next/link';
import { Clock } from 'lucide-react';
import type { MemoryNode } from '@/lib/api/memories';
import { EmptyState } from '@/components/shared/EmptyState';

interface MemoryTimelineProps {
  memories: MemoryNode[];
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1)  return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24)  return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

function statusColour(node: MemoryNode): string {
  if (node.processing_error) return 'var(--color-danger)';
  if (node.processed)        return 'var(--color-success)';
  return 'var(--color-agent)';
}

export function MemoryTimeline({ memories }: MemoryTimelineProps) {
  return (
    <div className="flex flex-col gap-3" data-testid="memory-timeline">
      <div className="flex items-center gap-2">
        <Clock size={14} aria-hidden="true" style={{ color: 'var(--color-muted)' }} />
        <h2 className="text-xs font-semibold uppercase tracking-widest"
          style={{ color: 'var(--color-muted)' }}>
          Recent Memories
        </h2>
      </div>

      {memories.length === 0 ? (
        <EmptyState
          title="No memories yet"
          description="Capture your first thought to start building your knowledge."
          action={{ label: 'Capture memory', href: '/memories/new' }}
          size="sm"
        />
      ) : (
        <ol className="flex flex-col gap-2" aria-label="Recent memories timeline">
          {memories.map(mem => (
            <li key={mem.id}>
              <Link
                href={`/memories/${mem.id}`}
                data-testid={`timeline-item-${mem.id}`}
                className="
                  group flex gap-3 rounded-lg border-l-2 pl-3 pr-2 py-2
                  transition-colors duration-fast hover:bg-surface-hover
                  focus-visible:outline-none focus-visible:ring-2
                  focus-visible:ring-brand focus-visible:ring-offset-1
                "
                style={{ borderLeftColor: statusColour(mem) }}
              >
                <div className="min-w-0 flex-1">
                  <p
                    className="truncate text-xs font-medium"
                    style={{ color: 'var(--color-fg)' }}
                  >
                    {mem.summary ?? mem.content.slice(0, 60)}
                  </p>
                  <p className="mt-0.5 text-[10px]" style={{ color: 'var(--color-muted)' }}>
                    {timeAgo(mem.created_at)}
                  </p>
                </div>
              </Link>
            </li>
          ))}
        </ol>
      )}

      {memories.length > 0 && (
        <Link
          href="/memories"
          data-testid="timeline-view-all"
          className="text-center text-xs font-medium transition-colors duration-fast hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand rounded"
          style={{ color: 'var(--color-brand)' }}
        >
          View all memories →
        </Link>
      )}
    </div>
  );
}
