/**
 * QuickActions — H-10
 * ====================
 * Keyboard-accessible shortcuts to frequent operations.
 * Static navigation — no API calls.
 *
 * @lifecycle Approved
 * @since v0.5.0 Phase H
 */

import Link from 'next/link';
import { Plus, Search, Network, GitBranch } from 'lucide-react';

interface QuickAction {
  label:   string;
  href:    string;
  icon:    React.ReactNode;
  colour:  string;
  testId:  string;
}

const ACTIONS: QuickAction[] = [
  {
    label:  'New Memory',
    href:   '/memories/new',
    icon:   <Plus    size={18} aria-hidden="true" />,
    colour: 'var(--color-brand)',
    testId: 'quick-action-new-memory',
  },
  {
    label:  'Search',
    href:   '/search',
    icon:   <Search  size={18} aria-hidden="true" />,
    colour: 'var(--color-intelligence)',
    testId: 'quick-action-search',
  },
  {
    label:  'Knowledge',
    href:   '/knowledge-graph',
    icon:   <Network size={18} aria-hidden="true" />,
    colour: 'var(--color-knowledge)',
    testId: 'quick-action-knowledge',
  },
  {
    label:  'Workflow',
    href:   '/workflow',
    icon:   <GitBranch size={18} aria-hidden="true" />,
    colour: 'var(--color-agent)',
    testId: 'quick-action-workflow',
  },
];

export function QuickActions() {
  return (
    <div
      className="grid grid-cols-2 gap-2 sm:grid-cols-4"
      data-testid="quick-actions"
      role="navigation"
      aria-label="Quick actions"
    >
      {ACTIONS.map(action => (
        <Link
          key={action.href}
          href={action.href}
          data-testid={action.testId}
          className="
            flex flex-col items-center gap-2 rounded-xl border p-4
            text-center text-xs font-medium
            transition-all duration-fast
            hover:border-current hover:bg-surface-hover
            focus-visible:outline-none focus-visible:ring-2
            focus-visible:ring-brand focus-visible:ring-offset-2
            focus-visible:ring-offset-bg
          "
          style={{
            borderColor: 'var(--color-border)',
            color:        action.colour,
          }}
        >
          <span
            className="flex h-8 w-8 items-center justify-center rounded-lg"
            style={{ backgroundColor: `color-mix(in srgb, ${action.colour} 12%, transparent)` }}
            aria-hidden="true"
          >
            {action.icon}
          </span>
          <span style={{ color: 'var(--color-fg)' }}>{action.label}</span>
        </Link>
      ))}
    </div>
  );
}
