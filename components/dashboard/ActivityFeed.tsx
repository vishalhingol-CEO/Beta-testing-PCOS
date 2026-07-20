/**
 * ActivityFeed — H-09
 * ====================
 * Chronological feed of system events.
 * All labels from lib/constants/activity-labels.ts.
 * Provider names: NEVER appear here.
 *
 * @lifecycle Approved
 * @since v0.5.0 Phase H
 */

import {
  Brain, CheckCircle2, XCircle, Search, Zap,
  Network, Sparkles, FileText, BookMarked,
} from 'lucide-react';
import type { ActivityEvent } from '@/lib/types/workflow-types';
import {
  ACTIVITY_LABELS,
  ACTIVITY_COLOURS,
  type ActivityEventType,
} from '@/lib/constants/activity-labels';

// ActivityEvent is defined in lib/types/workflow-types.ts
// Re-exported here for consumers that already import from this component
export type { ActivityEvent } from '@/lib/types/workflow-types';

interface ActivityFeedProps {
  events: ActivityEvent[];
}

const ICON_MAP: Record<string, React.ReactNode> = {
  Brain:        <Brain        size={14} aria-hidden="true" />,
  CheckCircle2: <CheckCircle2 size={14} aria-hidden="true" />,
  XCircle:      <XCircle      size={14} aria-hidden="true" />,
  Search:       <Search       size={14} aria-hidden="true" />,
  Zap:          <Zap          size={14} aria-hidden="true" />,
  Network:      <Network      size={14} aria-hidden="true" />,
  Sparkles:     <Sparkles     size={14} aria-hidden="true" />,
  FileText:     <FileText     size={14} aria-hidden="true" />,
  BookMarked:   <BookMarked   size={14} aria-hidden="true" />,
};

import { ACTIVITY_ICON_KEYS } from '@/lib/constants/activity-labels';

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1)  return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24)  return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export function ActivityFeed({ events }: ActivityFeedProps) {
  if (events.length === 0) {
    return (
      <p className="text-center text-sm py-6" style={{ color: 'var(--color-muted)' }}>
        Activity will appear here as you use PCOS.
      </p>
    );
  }

  return (
    <ol
      className="flex flex-col gap-1"
      aria-label="Recent activity"
      data-testid="activity-feed"
    >
      {events.map(event => {
        const label  = ACTIVITY_LABELS[event.type];
        const colour = ACTIVITY_COLOURS[event.type];
        const iconKey = ACTIVITY_ICON_KEYS[event.type];
        const icon   = ICON_MAP[iconKey] ?? <Zap size={14} aria-hidden="true" />;

        return (
          <li
            key={event.id}
            className="flex items-center gap-3 rounded-lg px-3 py-2 transition-colors duration-fast hover:bg-surface-hover"
            data-testid={`activity-event-${event.id}`}
          >
            <span
              className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full"
              style={{
                backgroundColor: `color-mix(in srgb, ${colour} 12%, transparent)`,
                color:            colour,
              }}
              aria-hidden="true"
            >
              {icon}
            </span>
            <span className="flex-1 min-w-0">
              <span className="text-xs font-medium" style={{ color: 'var(--color-fg)' }}>
                {label}
              </span>
              {event.meta && (
                <span className="ml-1 truncate text-xs" style={{ color: 'var(--color-muted)' }}>
                  — {event.meta}
                </span>
              )}
            </span>
            <span
              className="flex-shrink-0 font-mono text-[10px]"
              style={{ color: 'var(--color-muted)' }}
            >
              {timeAgo(event.timestamp)}
            </span>
          </li>
        );
      })}
    </ol>
  );
}
