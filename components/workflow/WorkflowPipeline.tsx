/**
 * WorkflowPipeline — 5-Layer Pipeline Visualizer
 * ================================================
 * Visual representation of the PCOS intelligence pipeline.
 * Phase H: static scaffold with idle/complete states.
 * v0.8: wired to live execution data.
 *
 * @lifecycle Approved
 * @since v0.5.0 Phase H
 */

import type { WorkflowStage, WorkflowStageStatus } from '@/lib/types/workflow-types';
import { CheckCircle2, AlertCircle, Clock, Loader2, ArrowRight } from 'lucide-react';

interface WorkflowPipelineProps {
  stages: WorkflowStage[];
}

const STATUS_CONFIG: Record<WorkflowStageStatus, { colour: string; icon: React.ReactNode; label: string }> = {
  idle:              { colour: 'var(--color-muted)',   icon: <Clock       size={16} aria-hidden="true" />, label: 'Waiting'           },
  active:            { colour: 'var(--color-intelligence)', icon: <Loader2  size={16} aria-hidden="true" className="animate-spin" />, label: 'Running' },
  complete:          { colour: 'var(--color-success)', icon: <CheckCircle2 size={16} aria-hidden="true" />, label: 'Complete'         },
  error:             { colour: 'var(--color-danger)',  icon: <AlertCircle  size={16} aria-hidden="true" />, label: 'Error'            },
  skipped:           { colour: 'var(--color-brand)',   icon: <CheckCircle2 size={16} aria-hidden="true" />, label: 'From memory'      },
  awaiting_approval: { colour: 'var(--color-agent)',   icon: <Clock        size={16} aria-hidden="true" />, label: 'Awaiting review'  },
};

export function WorkflowPipeline({ stages }: WorkflowPipelineProps) {
  return (
    <div
      className="flex flex-col gap-4 rounded-2xl border p-6"
      style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-surface)' }}
      data-testid="workflow-pipeline"
      role="list"
      aria-label="Intelligence pipeline stages"
    >
      {stages.map((stage, i) => {
        const cfg = STATUS_CONFIG[stage.status];
        return (
          <div key={stage.id} role="listitem">
            <div
              className="flex items-start gap-4 rounded-xl border p-4 transition-all duration-fast"
              data-testid={`pipeline-stage-${stage.id}`}
              style={{
                borderColor:     `color-mix(in srgb, ${cfg.colour} 25%, transparent)`,
                backgroundColor: `color-mix(in srgb, ${cfg.colour} 5%, transparent)`,
              }}
            >
              {/* Layer badge */}
              <div
                className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg text-xs font-bold text-white"
                style={{ backgroundColor: cfg.colour }}
                aria-label={`Layer ${stage.layer}`}
              >
                {stage.layer}
              </div>

              <div className="flex flex-1 flex-col gap-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="text-sm font-semibold" style={{ color: 'var(--color-fg)' }}>
                    {stage.name}
                  </h3>
                  <div className="flex items-center gap-1.5 flex-shrink-0" style={{ color: cfg.colour }}>
                    {cfg.icon}
                    <span className="text-xs font-medium">{cfg.label}</span>
                  </div>
                </div>
                <p className="text-xs" style={{ color: 'var(--color-muted)' }}>
                  {stage.description}
                </p>
                {(stage.latency_ms !== undefined || stage.tokens !== undefined) && (
                  <div className="mt-1 flex items-center gap-3">
                    {stage.latency_ms !== undefined && (
                      <span className="font-mono text-[10px]" style={{ color: 'var(--color-muted)' }}>
                        {stage.latency_ms}ms
                      </span>
                    )}
                    {stage.tokens !== undefined && (
                      <span className="font-mono text-[10px]" style={{ color: 'var(--color-muted)' }}>
                        {stage.tokens} tokens
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Connector */}
            {i < stages.length - 1 && (
              <div className="flex justify-center py-1" aria-hidden="true">
                <ArrowRight size={14} style={{ color: 'var(--color-border)' }} />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
