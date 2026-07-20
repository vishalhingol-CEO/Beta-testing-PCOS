/**
 * ActiveTasksPanel — H-11
 * ========================
 * QA-H-005: Phase H Active Tasks panel.
 * Shows tasks derived from memory processing pipeline state.
 *
 * Phase H scope:
 * - Memories currently processing → "Indexing N memories"
 * - Failed memories → "N memories need attention"
 * - No user-authored tasks (those require agents, v0.7)
 * - No autonomous agent tasks (G4)
 *
 * IMPORTANT: This is NOT a G4 autonomous task manager.
 * It surfaces actionable pipeline state, not agent assignments.
 *
 * @lifecycle Approved — QA-H-005 remediation
 * @since v0.5.0 Phase H
 */

import Link from 'next/link';
import { ListTodo, RefreshCcw, AlertTriangle, CheckCircle2 } from 'lucide-react';
import type { PCOSStats } from '@/lib/api/stats';

interface ActiveTask {
  id:      string;
  label:   string;
  href:    string;
  type:    'processing' | 'failed' | 'complete';
  count:   number;
}

interface ActiveTasksPanelProps {
  stats: PCOSStats;
}

function buildTasks(stats: PCOSStats): ActiveTask[] {
  const tasks: ActiveTask[] = [];

  if (stats.processing_nodes > 0) {
    tasks.push({
      id:    'indexing',
      label: `Indexing ${stats.processing_nodes} ${stats.processing_nodes === 1 ? 'memory' : 'memories'}`,
      href:  '/memories?status=processing',
      type:  'processing',
      count: stats.processing_nodes,
    });
  }

  if (stats.failed_nodes > 0) {
    tasks.push({
      id:    'failed',
      label: `${stats.failed_nodes} ${stats.failed_nodes === 1 ? 'memory' : 'memories'} need attention`,
      href:  '/memories?status=failed',
      type:  'failed',
      count: stats.failed_nodes,
    });
  }

  return tasks;
}

const TASK_ICON: Record<ActiveTask['type'], React.ReactNode> = {
  processing: <RefreshCcw  size={14} className="animate-spin" aria-hidden="true" />,
  failed:     <AlertTriangle size={14} aria-hidden="true" />,
  complete:   <CheckCircle2  size={14} aria-hidden="true" />,
};

const TASK_COLOUR: Record<ActiveTask['type'], string> = {
  processing: 'var(--color-agent)',
  failed:     'var(--color-danger)',
  complete:   'var(--color-success)',
};

export function ActiveTasksPanel({ stats }: ActiveTasksPanelProps) {
  const tasks = buildTasks(stats);

  return (
    <div
      className="pcos-glass flex flex-col gap-3 rounded-xl p-4"
      data-testid="active-tasks-panel"
    >
      <div className="flex items-center gap-2">
        <ListTodo size={16} aria-hidden="true" style={{ color: 'var(--color-agent)' }} />
        <h2 className="text-sm font-semibold" style={{ color: 'var(--color-fg)' }}>
          Active Tasks
        </h2>
      </div>

      {tasks.length === 0 ? (
        <div className="flex items-center gap-2 py-2">
          <CheckCircle2 size={14} aria-hidden="true" style={{ color: 'var(--color-success)' }} />
          <p className="text-xs" style={{ color: 'var(--color-muted)' }}>
            All systems operational
          </p>
        </div>
      ) : (
        <ul className="flex flex-col gap-2" aria-label="Active tasks" role="list">
          {tasks.map(task => (
            <li key={task.id} role="listitem">
              <Link
                href={task.href}
                data-testid={`active-task-${task.id}`}
                className="
                  flex items-center gap-3 rounded-lg px-3 py-2
                  transition-colors duration-fast hover:bg-surface-hover
                  focus-visible:outline-none focus-visible:ring-2
                  focus-visible:ring-brand focus-visible:ring-offset-1
                "
                aria-label={task.label}
              >
                <span
                  className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full"
                  style={{
                    backgroundColor: `color-mix(in srgb, ${TASK_COLOUR[task.type]} 12%, transparent)`,
                    color:            TASK_COLOUR[task.type],
                  }}
                >
                  {TASK_ICON[task.type]}
                </span>
                <span className="flex-1 text-xs font-medium" style={{ color: 'var(--color-fg)' }}>
                  {task.label}
                </span>
                <span
                  className="flex-shrink-0 rounded-full px-2 py-0.5 font-mono text-[10px] font-bold"
                  style={{
                    backgroundColor: `color-mix(in srgb, ${TASK_COLOUR[task.type]} 12%, transparent)`,
                    color:            TASK_COLOUR[task.type],
                  }}
                >
                  {task.count}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}

      {/* Phase I hook: user-authored tasks will appear here in v0.7 */}
      {/* Phase G4 hook: autonomous agent tasks will appear here in v1.0+ */}
    </div>
  );
}
