/**
 * Memory Detail Page — H-02 (fixed Shell header prop)
 * @since v0.5.0 Phase H
 */

import { notFound }        from 'next/navigation';
import Link                from 'next/link';
import { Edit3 }           from 'lucide-react';
import { Shell }           from '@/components/layout/Shell';
import { TopBar }          from '@/components/layout/TopBar';
import { ProcessingBadge } from '@/components/memory/ProcessingBadge';
import { GlassCard }       from '@/components/ui/GlassCard';
import { Badge }           from '@/components/ui/Badge';
import { getServerMemory } from '@/lib/api/server-data';
import { PIPELINE_STAGE_LABELS } from '@/lib/constants/ux-labels';

export const dynamic    = 'force-dynamic';
export const revalidate = 0;

interface PageProps {
  params:       { id: string };
  searchParams: { debug?: string; processing?: string };
}

function ProcessingTimeline({ processed, error }: { processed: boolean; error?: string | null }) {
  const stages = [
    { key: 'created',   label: PIPELINE_STAGE_LABELS.created,  done: true },
    { key: 'embedding', label: PIPELINE_STAGE_LABELS.embedding, done: processed || !!error },
    { key: 'enriched',  label: PIPELINE_STAGE_LABELS.enriched,  done: processed },
    { key: 'indexed',   label: PIPELINE_STAGE_LABELS.indexed,   done: processed },
  ];
  return (
    <div className="flex items-center gap-1" role="list" aria-label="Processing pipeline stages" data-testid="processing-timeline">
      {stages.map((stage, i) => (
        <div key={stage.key} className="flex items-center gap-1" role="listitem">
          <div className="flex flex-col items-center gap-1">
            <div
              className="flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-bold"
              style={{
                backgroundColor: stage.done ? 'var(--color-success)' : error && i > 0 ? 'var(--color-danger)' : 'var(--color-border)',
                color: stage.done || (error && i > 0) ? 'white' : 'var(--color-muted)',
              }}
              aria-label={`${stage.label}: ${stage.done ? 'complete' : 'pending'}`}
            >
              {stage.done ? '✓' : i + 1}
            </div>
            <span className="text-[9px] whitespace-nowrap" style={{ color: 'var(--color-muted)' }}>
              {stage.label}
            </span>
          </div>
          {i < stages.length - 1 && (
            <div className="mb-4 h-px w-6 flex-shrink-0" style={{ backgroundColor: stage.done ? 'var(--color-success)' : 'var(--color-border)' }} aria-hidden="true" />
          )}
        </div>
      ))}
    </div>
  );
}

export default async function MemoryDetailPage({ params, searchParams }: PageProps) {
  const memory = await getServerMemory(params.id);
  if (!memory) notFound();

  const isDebug      = searchParams.debug === 'true';
  const isProcessing = searchParams.processing === 'true';
  const wordCount    = memory.content.split(/\s+/).filter(Boolean).length;

  const editActions = (
    <Link
      href={`/memories/${memory.id}/edit`}
      data-testid="memory-detail-edit-btn"
      aria-label="Edit this memory"
      className="flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors duration-fast hover:bg-surface-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
      style={{ borderColor: 'var(--color-border)', color: 'var(--color-muted)' }}
    >
      <Edit3 size={12} aria-hidden="true" />
      Edit
    </Link>
  );

  return (
    <Shell
      header={
        <TopBar
          breadcrumb={[
            { label: 'Memory', href: '/memories' },
            { label: memory.summary?.slice(0, 40) ?? memory.content.slice(0, 40) },
          ]}
          actions={editActions}
        />
      }
    >
      <div className="mx-auto max-w-3xl space-y-6">
        {isProcessing && !memory.processed && (
          <div className="rounded-xl border px-4 py-3 text-sm" role="status"
            style={{ borderColor: 'color-mix(in srgb, var(--color-agent) 30%, transparent)', backgroundColor: 'color-mix(in srgb, var(--color-agent) 8%, transparent)', color: 'var(--color-agent)' }}>
            Memory saved. Indexing is running in the background — this usually takes a few seconds.
          </div>
        )}

        <div className="flex flex-wrap items-center justify-between gap-4">
          <ProcessingBadge processed={memory.processed} error={memory.processing_error} memoryId={memory.id} />
          <ProcessingTimeline processed={memory.processed} error={memory.processing_error} />
        </div>

        <div className="rounded-2xl border p-6" style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-surface)' }}>
          <p className="whitespace-pre-wrap text-base leading-relaxed" style={{ color: 'var(--color-fg)' }} data-testid="memory-content">
            {memory.content}
          </p>
          <p className="mt-4 text-xs" style={{ color: 'var(--color-muted)' }}>{wordCount} words · {memory.content.length} characters</p>
        </div>

        {memory.processed && (
          <div className="space-y-4">
            {memory.summary && (
              <GlassCard>
                <h2 className="mb-2 text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--color-muted)' }}>Summary</h2>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--color-fg)' }} data-testid="memory-summary">{memory.summary}</p>
              </GlassCard>
            )}
            {memory.tags.length > 0 && (
              <div>
                <h2 className="mb-2 text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--color-muted)' }}>Tags</h2>
                <div className="flex flex-wrap gap-2" role="list" aria-label="Memory tags" data-testid="memory-tags">
                  {memory.tags.map(tag => <Badge key={tag} variant="default">{tag}</Badge>)}
                </div>
              </div>
            )}
            {memory.entities.length > 0 && (
              <div>
                <h2 className="mb-2 text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--color-muted)' }}>Entities</h2>
                <div className="flex flex-wrap gap-2" role="list" aria-label="Extracted entities" data-testid="memory-entities">
                  {memory.entities.map(entity => <Badge key={entity} variant="muted">{entity}</Badge>)}
                </div>
              </div>
            )}
          </div>
        )}

        {isDebug && (
          <GlassCard data-testid="memory-debug-panel">
            <h2 className="mb-3 font-mono text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--color-intelligence)' }}>Debug Panel</h2>
            <pre className="overflow-x-auto rounded-lg p-3 font-mono text-[10px] leading-relaxed" style={{ backgroundColor: 'var(--color-surface)', color: 'var(--color-muted)' }}>
              {JSON.stringify({ id: memory.id, processed: memory.processed, has_embedding: memory.embedding !== null, entity_count: memory.entities.length, tag_count: memory.tags.length, processing_error: memory.processing_error }, null, 2)}
            </pre>
          </GlassCard>
        )}
      </div>
    </Shell>
  );
}
