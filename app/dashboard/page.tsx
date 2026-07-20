/**
 * Dashboard Page — G4-SA Updated
 * =================================
 * Now passes session to Shell for sidebar identity zone.
 * All data fetching via getServer*() functions (ADR-G4-001).
 *
 * @since v0.5.0 Phase H
 * @updated v0.6.0 G4-SA (session passed to Shell)
 */

import { Suspense }              from 'react';
import { Shell }                 from '@/components/layout/Shell';
import { TopBar }                from '@/components/layout/TopBar';
import { WelcomeZone }           from '@/components/dashboard/WelcomeZone';
import { MemoryHealthPanel }     from '@/components/dashboard/MemoryHealthPanel';
import { AIUsagePanel }          from '@/components/dashboard/AIUsagePanel';
import { QuickActions }          from '@/components/dashboard/QuickActions';
import { MemoryTimeline }        from '@/components/dashboard/MemoryTimeline';
import { ActivityFeed }          from '@/components/dashboard/ActivityFeed';
import { IntelligenceOrb }       from '@/components/intelligence/IntelligenceOrb';
import { ProviderHealthDots }    from '@/components/intelligence/ProviderHealthDots';
import { Skeleton }              from '@/components/ui/Skeleton';
import { ActiveTasksPanel }      from '@/components/dashboard/ActiveTasksPanel';
import { KnowledgeGraphMinimap } from '@/components/graph/KnowledgeGraphMinimap';
import {
  getServerStats,
  getServerMemories,
  getServerProviderHealth,
  getServerRecentEvents,
} from '@/lib/api/server-data';
import { getServerSession }      from '@/lib/auth/session';
import type { ActivityEventType } from '@/lib/constants/activity-labels';
import type { ActivityEvent }    from '@/lib/types/workflow-types';

export const dynamic    = 'force-dynamic';
export const revalidate = 0;

const EVENT_TYPE_MAP: Record<string, ActivityEventType> = {
  'memory.created':        'memory_created',
  'memory.processed':      'memory_processed',
  'memory.failed':         'memory_failed',
  'search.performed':      'search_performed',
  'ai.call_made':          'context_queried',
  'ai.pipeline_completed': 'context_queried',
  'ai.memory_hit':         'skip_ai_event',
  'nie.memory_hit':        'skip_ai_event',
  'nie.memory_miss':       'context_queried',
};

async function DashboardContent() {
  const [stats, recentMemories, health, rawEvents, allMemories] = await Promise.all([
    getServerStats(),
    getServerMemories(8),
    getServerProviderHealth(),
    getServerRecentEvents(15),
    getServerMemories(60),
  ]);

  const recentEvents: ActivityEvent[] = rawEvents.reduce<ActivityEvent[]>((acc: ActivityEvent[], e: Record<string, unknown>) => {
    const type = EVENT_TYPE_MAP[e.event_type as string];
    if (!type) return acc;
    const payload = e.payload as Record<string, unknown> | null;
    const meta = payload?.summary ?? payload?.content_preview ?? payload?.query;
    acc.push({
      id:        e.id as string,
      type,
      timestamp: e.created_at as string,
      meta:      typeof meta === 'string' ? meta.slice(0, 50) : undefined,
    });
    return acc;
  }, []);

  const tagFreq = new Map<string, number>();
  for (const mem of allMemories) {
    for (const tag of mem.tags) tagFreq.set(tag, (tagFreq.get(tag) ?? 0) + 1);
  }
  const coOccurrence = new Map<string, number>();
  for (const mem of allMemories) {
    const tags = mem.tags;
    for (let i = 0; i < tags.length; i++) {
      for (let j = i + 1; j < tags.length; j++) {
        const key = [tags[i], tags[j]].sort().join('|');
        coOccurrence.set(key, (coOccurrence.get(key) ?? 0) + 1);
      }
    }
  }
  const graphNodes = Array.from(tagFreq.entries())
    .sort((a, b) => b[1] - a[1]).slice(0, 20)
    .map(([id, freq]) => ({ id, freq }));
  const nodeIds = new Set(graphNodes.map(n => n.id));
  const graphEdges = Array.from(coOccurrence.entries())
    .map(([key, weight]) => {
      const [source, target] = key.split('|');
      return { source, target, weight };
    })
    .filter(e => nodeIds.has(e.source) && nodeIds.has(e.target));

  const orbState = stats.processing_nodes > 0 ? 'processing' : 'idle';

  return (
    <div className="flex flex-col gap-6 lg:grid lg:grid-cols-[1fr_280px] lg:gap-8">
      <div className="flex flex-col gap-6">
        <WelcomeZone totalMemories={stats.total_nodes} />
        <div className="pcos-glass flex items-center gap-6 rounded-2xl p-6" data-testid="intelligence-panel">
          <IntelligenceOrb state={orbState} memoryCount={stats.total_nodes} processingCount={stats.processing_nodes} size={96} />
          <div className="flex flex-col gap-2">
            <p className="text-sm font-semibold" style={{ color: 'var(--color-fg)' }}>
              {stats.processing_nodes > 0 ? `Indexing ${stats.processing_nodes} ${stats.processing_nodes === 1 ? 'memory' : 'memories'}…` : 'System ready'}
            </p>
            <p className="text-xs" style={{ color: 'var(--color-muted)' }}>
              {stats.processed_nodes} of {stats.total_nodes} memories indexed
            </p>
            {health.providers.length > 0 && (
              <div className="flex items-center gap-2 mt-1">
                <span className="text-[10px]" style={{ color: 'var(--color-muted)' }}>Capabilities</span>
                <ProviderHealthDots providers={health.providers} size="sm" />
              </div>
            )}
          </div>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <MemoryHealthPanel stats={stats} />
          <AIUsagePanel stats={stats} />
        </div>
        <QuickActions />
        <section aria-labelledby="activity-heading">
          <h2 id="activity-heading" className="mb-3 text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--color-muted)' }}>
            Recent Activity
          </h2>
          <div className="pcos-glass rounded-xl p-2">
            <ActivityFeed events={recentEvents} />
          </div>
        </section>
      </div>
      <aside className="flex flex-col gap-4" aria-label="Tasks, knowledge, and memory timeline">
        <ActiveTasksPanel stats={stats} />
        <KnowledgeGraphMinimap nodes={graphNodes} edges={graphEdges} />
        <div className="pcos-glass rounded-xl p-4">
          <MemoryTimeline memories={recentMemories} />
        </div>
      </aside>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="flex flex-col gap-6 lg:grid lg:grid-cols-[1fr_280px] lg:gap-8">
      <div className="flex flex-col gap-6">
        <Skeleton className="h-12 w-64 rounded-xl" />
        <Skeleton className="h-32 w-full rounded-2xl" />
        <div className="grid grid-cols-2 gap-4">
          <Skeleton className="h-40 rounded-xl" />
          <Skeleton className="h-40 rounded-xl" />
        </div>
        <Skeleton className="h-20 rounded-xl" />
        <Skeleton className="h-48 rounded-xl" />
      </div>
      <div><Skeleton className="h-96 rounded-xl" /></div>
    </div>
  );
}

export default async function DashboardPage() {
  const session = await getServerSession();
  return (
    <Shell header={<TopBar title="Dashboard" />} session={session}>
      <Suspense fallback={<DashboardSkeleton />}>
        <DashboardContent />
      </Suspense>
    </Shell>
  );
}
