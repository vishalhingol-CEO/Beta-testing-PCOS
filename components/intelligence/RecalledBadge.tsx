/**
 * RecalledBadge — Memory Recall Attribution
 * ===========================================
 * Shown when a response was served entirely from memory (skip_ai = true).
 * NEVER attributes to a provider — only ever says "Answered from memory."
 *
 * Constitution Law 2 enforcement: this badge is the UI expression of
 * the memory-first architecture. When it appears, the user knows their
 * accumulated knowledge answered their query without AI cost.
 *
 * @param tokensSaved - Optional token savings to surface
 * @param size        - Badge size variant
 *
 * @lifecycle Approved
 * @since v0.5.0 Phase H
 * @owner Lead Frontend Architect
 */

import { MEMORY_RECALL_LABEL } from '@/lib/constants/ux-labels';

interface RecalledBadgeProps {
  tokensSaved?: number;
  size?:        'sm' | 'md';
  className?:   string;
}

export function RecalledBadge({
  tokensSaved,
  size      = 'md',
  className = '',
}: RecalledBadgeProps) {
  const isSmall = size === 'sm';

  return (
    <span
      role="status"
      aria-label={`${MEMORY_RECALL_LABEL}${tokensSaved ? ` — ${tokensSaved} tokens saved` : ''}`}
      data-testid="recalled-badge"
      className={`
        inline-flex items-center gap-1.5 rounded-full border px-2.5 font-medium
        ${isSmall ? 'py-0.5 text-xs' : 'py-1 text-xs'}
        ${className}
      `.trim()}
      style={{
        color:           'var(--color-memory)',
        borderColor:     'color-mix(in srgb, var(--color-memory) 30%, transparent)',
        backgroundColor: 'color-mix(in srgb, var(--color-memory) 10%, transparent)',
      }}
    >
      {/* Memory dot */}
      <span
        aria-hidden="true"
        className="inline-block h-1.5 w-1.5 rounded-full flex-shrink-0"
        style={{ backgroundColor: 'var(--color-memory)' }}
      />

      <span aria-hidden="true">
        {MEMORY_RECALL_LABEL}
      </span>

      {tokensSaved !== undefined && tokensSaved > 0 && (
        <span
          className="font-mono opacity-70"
          aria-hidden="true"
        >
          {tokensSaved.toLocaleString()} saved
        </span>
      )}
    </span>
  );
}
