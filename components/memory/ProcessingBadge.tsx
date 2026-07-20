/**
 * ProcessingBadge — Memory pipeline status indicator
 * ====================================================
 * Shows memory processing state using IntelligenceStatus.
 * NEVER shows a provider name — only pipeline state labels.
 *
 * @param processed  - Whether the memory is fully processed
 * @param error      - Processing error string if failed
 * @param memoryId   - For retry link
 *
 * @lifecycle Approved
 * @since v0.5.0 Phase H
 */

'use client';
// Reason: retry action requires client interaction

import Link from 'next/link';
import { CheckCircle2, XCircle, RefreshCcw } from 'lucide-react';
import { PROCESSING_LABEL, MEMORY_INDEXED_LABEL } from '@/lib/constants/ux-labels';

interface ProcessingBadgeProps {
  processed:  boolean;
  error?:     string | null;
  memoryId?:  string;
}

export function ProcessingBadge({ processed, error, memoryId }: ProcessingBadgeProps) {
  if (error) {
    return (
      <div className="flex items-center gap-1.5" data-testid="processing-badge-failed">
        <XCircle size={12} aria-hidden="true" style={{ color: 'var(--color-danger)', flexShrink: 0 }} />
        <span className="text-xs font-medium" style={{ color: 'var(--color-danger)' }}>
          Processing failed
        </span>
        {memoryId && (
          <Link
            href={`/memories/${memoryId}`}
            data-testid="processing-badge-retry-link"
            aria-label="View failed memory details"
            className="ml-1 rounded text-[10px] underline focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-danger"
            style={{ color: 'var(--color-danger)' }}
          >
            Details
          </Link>
        )}
      </div>
    );
  }

  if (processed) {
    return (
      <div className="flex items-center gap-1.5" data-testid="processing-badge-done">
        <CheckCircle2 size={12} aria-hidden="true" style={{ color: 'var(--color-success)', flexShrink: 0 }} />
        <span className="text-xs font-medium" style={{ color: 'var(--color-success)' }}>
          {MEMORY_INDEXED_LABEL}
        </span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1.5" data-testid="processing-badge-processing">
      <RefreshCcw
        size={12}
        aria-hidden="true"
        className="animate-spin"
        style={{ color: 'var(--color-agent)', flexShrink: 0 }}
      />
      <span className="text-xs font-medium" style={{ color: 'var(--color-agent)' }}>
        {PROCESSING_LABEL}
      </span>
    </div>
  );
}
