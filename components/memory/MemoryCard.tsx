/**
 * MemoryCard — Memory node display card
 * =======================================
 * Used in: Memory list, Memory timeline, Search results (search variant).
 *
 * @param memory   - The full MemoryNode record
 * @param variant  - 'compact' for list, 'standard' for grid
 * @param onDelete - Optional delete handler; omit to hide delete action
 *
 * API: GET /api/memories or GET /api/memories/[id]
 * Auth: None in v0.5.0; RLS-scoped in v0.6
 *
 * @lifecycle Approved
 * @since v0.5.0 Phase H
 */

'use client';
// Reason: delete confirmation state

import { useState } from 'react';
import Link from 'next/link';
import { Trash2, Edit3, Clock } from 'lucide-react';
import type { MemoryNode } from '@/lib/api/memories';
import { ProcessingBadge } from './ProcessingBadge';

type CardVariant = 'compact' | 'standard';

interface MemoryCardProps {
  memory:   MemoryNode;
  variant?: CardVariant;
  onDelete?: (id: string) => Promise<void>;
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

export function MemoryCard({ memory, variant = 'standard', onDelete }: MemoryCardProps) {
  const [deleting, setDeleting] = useState(false);
  const [confirm,  setConfirm]  = useState(false);

  async function handleDelete() {
    if (!onDelete) return;
    if (!confirm) { setConfirm(true); return; }
    setDeleting(true);
    try { await onDelete(memory.id); }
    finally { setDeleting(false); setConfirm(false); }
  }

  const excerpt = memory.summary ?? memory.content;
  const preview = excerpt.length > 120 ? excerpt.slice(0, 120) + '…' : excerpt;

  return (
    <article
      className="
        pcos-glass group relative flex flex-col gap-3 rounded-xl p-4
        transition-all duration-fast hover:shadow-md
      "
      data-testid={`memory-card-${memory.id}`}
      aria-label={`Memory: ${preview}`}
    >
      {/* Content preview */}
      <Link
        href={`/memories/${memory.id}`}
        data-testid={`memory-card-link-${memory.id}`}
        className="
          flex-1 min-w-0
          focus-visible:outline-none focus-visible:ring-2
          focus-visible:ring-brand focus-visible:ring-offset-1 rounded
        "
      >
        <p
          className={`font-medium leading-snug ${variant === 'compact' ? 'text-xs line-clamp-2' : 'text-sm line-clamp-3'}`}
          style={{ color: 'var(--color-fg)' }}
        >
          {preview}
        </p>
      </Link>

      {/* Tags */}
      {memory.tags.length > 0 && (
        <div className="flex flex-wrap gap-1" role="list" aria-label="Tags">
          {memory.tags.slice(0, 4).map(tag => (
            <span
              key={tag}
              role="listitem"
              className="rounded-full px-2 py-0.5 text-[10px] font-medium"
              style={{
                backgroundColor: 'color-mix(in srgb, var(--color-brand) 10%, transparent)',
                color:            'var(--color-brand)',
              }}
            >
              {tag}
            </span>
          ))}
          {memory.tags.length > 4 && (
            <span className="text-[10px]" style={{ color: 'var(--color-muted)' }}>
              +{memory.tags.length - 4}
            </span>
          )}
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between gap-2">
        <ProcessingBadge
          processed={memory.processed}
          error={memory.processing_error}
          memoryId={memory.id}
        />

        <div className="flex items-center gap-1 ml-auto">
          <span
            className="flex items-center gap-1 text-[10px]"
            style={{ color: 'var(--color-muted)' }}
          >
            <Clock size={10} aria-hidden="true" />
            {timeAgo(memory.created_at)}
          </span>

          <Link
            href={`/memories/${memory.id}/edit`}
            data-testid={`memory-card-edit-btn-${memory.id}`}
            aria-label="Edit this memory"
            className="
              rounded p-1 opacity-0 transition-opacity duration-fast
              group-hover:opacity-100
              hover:bg-surface-hover
              focus-visible:opacity-100 focus-visible:outline-none
              focus-visible:ring-2 focus-visible:ring-brand
            "
            style={{ color: 'var(--color-muted)' }}
          >
            <Edit3 size={12} aria-hidden="true" />
          </Link>

          {onDelete && (
            <button
              type="button"
              onClick={handleDelete}
              disabled={deleting}
              data-testid={`memory-card-delete-btn-${memory.id}`}
              aria-label={confirm ? 'Click again to confirm delete' : 'Delete this memory'}
              className="
                rounded p-1 opacity-0 transition-all duration-fast
                group-hover:opacity-100
                focus-visible:opacity-100 focus-visible:outline-none
                focus-visible:ring-2 focus-visible:ring-danger
              "
              style={{ color: confirm ? 'var(--color-danger)' : 'var(--color-muted)' }}
            >
              <Trash2 size={12} aria-hidden="true" />
            </button>
          )}
        </div>
      </div>
    </article>
  );
}
