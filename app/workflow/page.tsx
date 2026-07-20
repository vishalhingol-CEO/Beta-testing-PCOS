/**
 * Workflow Page — H-05
 * =====================
 * Static 5-stage pipeline visualization scaffold.
 * Foundation for live workflow execution (v0.8).
 *
 * @since v0.5.0 Phase H
 */

import { getServerSession } from '@/lib/auth/session';
import { Shell }   from '@/components/layout/Shell';
import { TopBar }  from '@/components/layout/TopBar';
import { WorkflowPipeline } from '@/components/workflow/WorkflowPipeline';
import { PCOS_PIPELINE_STAGES } from '@/lib/types/workflow-types';

export default async function WorkflowPage() {
  const session = await getServerSession();
  // Static scaffold in Phase H — all stages shown as 'idle'
  const stages = PCOS_PIPELINE_STAGES.map(s => ({ ...s, status: 'idle' as const }));

  return (
    <Shell header={<TopBar title="Workflow" />} session={session}>
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-xl font-bold" style={{ color: 'var(--color-fg)' }}>
            Intelligence Pipeline
          </h1>
          <p className="mt-1 text-sm" style={{ color: 'var(--color-muted)' }}>
            Every query passes through 5 layers. Live execution arrives in v0.8.
          </p>
        </div>
        <WorkflowPipeline stages={stages} />
      </div>
    </Shell>
  );
}
