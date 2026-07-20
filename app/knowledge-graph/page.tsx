/**
 * Knowledge Graph Page — H-06 (HOTFIX G4-HF-01)
 * ================================================
 * Full-screen D3 force-directed graph from tag co-occurrence.
 * Client Component: D3 requires DOM access.
 * Mobile: replaces canvas with sorted tag list.
 *
 * HOTFIX G4-HF-01: Replaced fetchStats() and fetchMemories() HTTP self-calls
 * with getServerStats() and getServerMemories() direct Supabase queries.
 * Per ADR-G4-001: Server Components must never make HTTP calls to own origin.
 *
 * @since v0.5.0 Phase H
 * @updated v0.6.0 G4-HF-01
 */

import { getServerSession } from '@/lib/auth/session';
import { Shell }            from '@/components/layout/Shell';
import { TopBar }           from '@/components/layout/TopBar';
import { KnowledgeGraphCanvas } from '@/components/graph/KnowledgeGraphCanvas';
import { getServerStats, getServerMemories } from '@/lib/api/server-data';

export const dynamic    = 'force-dynamic';
export const revalidate = 0;

export default async function KnowledgeGraphPage() {
  const session = await getServerSession();

  // Direct Supabase queries — no HTTP self-calls (ADR-G4-001)
  const [stats, memories] = await Promise.all([
    getServerStats(),
    getServerMemories(100),
  ]);

  // Build tag co-occurrence graph
  const tagFreq = new Map<string, number>();
  for (const mem of memories) {
    for (const tag of mem.tags) {
      tagFreq.set(tag, (tagFreq.get(tag) ?? 0) + 1);
    }
  }

  const coOccurrence = new Map<string, number>();
  for (const mem of memories) {
    const tags = mem.tags;
    for (let i = 0; i < tags.length; i++) {
      for (let j = i + 1; j < tags.length; j++) {
        const key = [tags[i], tags[j]].sort().join('|');
        coOccurrence.set(key, (coOccurrence.get(key) ?? 0) + 1);
      }
    }
  }

  const topTags = Array.from(tagFreq.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 20);

  const nodes = topTags.map(([id, freq]) => ({ id, freq }));
  const nodeIds = new Set(nodes.map(n => n.id));

  const edges = Array.from(coOccurrence.entries())
    .map(([key, weight]) => {
      const [source, target] = key.split('|');
      return { source, target, weight };
    })
    .filter(e => nodeIds.has(e.source) && nodeIds.has(e.target) && e.weight > 1);

  return (
    <Shell header={<TopBar title="Knowledge Graph" />} session={session}>
      <KnowledgeGraphCanvas
        nodes={nodes}
        edges={edges}
        totalMemories={stats.total_nodes}
      />
    </Shell>
  );
}
