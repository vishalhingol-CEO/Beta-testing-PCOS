/**
 * KnowledgeGraphMinimap — Dashboard Knowledge Graph Preview (H-06 Minimap)
 * ==========================================================================
 * QA-H-008: Lightweight minimap — does NOT duplicate KnowledgeGraphCanvas.
 * Renders a static SVG dot-cluster using pre-computed node data.
 * No D3 dependency — pure SVG layout algorithm (circular placement).
 *
 * Full graph: /knowledge-graph (KnowledgeGraphCanvas with D3 + pan/zoom)
 * Minimap:    /dashboard panel (this component, static SVG, no D3)
 *
 * @lifecycle Approved — QA-H-008 remediation
 * @since v0.5.0 Phase H
 */

import Link from 'next/link';
import { Network } from 'lucide-react';
import type { GraphNode, GraphEdge } from './KnowledgeGraphCanvas';

interface KnowledgeGraphMinimapProps {
  nodes: GraphNode[];
  edges: GraphEdge[];
  /** Max nodes to render in minimap (default: 12) */
  maxNodes?: number;
}

const MINIMAP_W = 200;
const MINIMAP_H = 120;
const COLOURS   = [
  'var(--color-brand)',
  'var(--color-memory)',
  'var(--color-intelligence)',
  'var(--color-knowledge)',
  'var(--color-agent)',
  'var(--color-compose)',
  'var(--color-code)',
];

/** Distributes nodes in an oval — no D3 required */
function layoutNodes(nodes: GraphNode[]): { id: string; x: number; y: number; r: number }[] {
  const cx  = MINIMAP_W / 2;
  const cy  = MINIMAP_H / 2;
  const rx  = MINIMAP_W * 0.42;
  const ry  = MINIMAP_H * 0.38;
  const max = Math.max(...nodes.map(n => n.freq), 1);

  return nodes.map((node, i) => {
    const angle = (i / nodes.length) * Math.PI * 2 - Math.PI / 2;
    return {
      id: node.id,
      x:  cx + rx * Math.cos(angle),
      y:  cy + ry * Math.sin(angle),
      r:  3 + (node.freq / max) * 5,
    };
  });
}

export function KnowledgeGraphMinimap({
  nodes,
  edges,
  maxNodes = 12,
}: KnowledgeGraphMinimapProps) {
  const topNodes   = nodes.slice(0, maxNodes);
  const layout     = layoutNodes(topNodes);
  const layoutMap  = new Map(layout.map(n => [n.id, n]));

  // Only render edges between visible nodes
  const visibleEdges = edges.filter(
    e => layoutMap.has(e.source) && layoutMap.has(e.target)
  ).slice(0, 20);

  return (
    <div
      className="pcos-glass flex flex-col gap-3 rounded-xl p-4"
      data-testid="knowledge-graph-minimap"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Network size={14} aria-hidden="true" style={{ color: 'var(--color-knowledge)' }} />
          <h2 className="text-sm font-semibold" style={{ color: 'var(--color-fg)' }}>
            Knowledge Graph
          </h2>
        </div>
        <Link
          href="/knowledge-graph"
          data-testid="minimap-expand-link"
          className="text-[10px] font-medium transition-colors hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand rounded"
          style={{ color: 'var(--color-knowledge)' }}
          aria-label="Open full knowledge graph"
        >
          Expand →
        </Link>
      </div>

      {topNodes.length === 0 ? (
        <p className="py-4 text-center text-xs" style={{ color: 'var(--color-muted)' }}>
          Add memories with tags to build your graph.
        </p>
      ) : (
        <svg
          width={MINIMAP_W}
          height={MINIMAP_H}
          viewBox={`0 0 ${MINIMAP_W} ${MINIMAP_H}`}
          className="w-full"
          role="img"
          aria-label={`Knowledge graph preview: ${topNodes.length} topics, ${visibleEdges.length} connections`}
          style={{ maxHeight: 120 }}
        >
          {/* Edges */}
          {visibleEdges.map((edge, i) => {
            const s = layoutMap.get(edge.source);
            const t = layoutMap.get(edge.target);
            if (!s || !t) return null;
            return (
              <line
                key={i}
                x1={s.x} y1={s.y} x2={t.x} y2={t.y}
                stroke="var(--color-border)"
                strokeWidth={Math.min(edge.weight * 0.4, 1.5)}
                strokeOpacity={0.5}
              />
            );
          })}

          {/* Nodes */}
          {layout.map((node, i) => (
            <g key={node.id}>
              <circle
                cx={node.x}
                cy={node.y}
                r={node.r}
                fill={COLOURS[i % COLOURS.length]}
                fillOpacity={0.85}
                aria-hidden="true"
              />
            </g>
          ))}
        </svg>
      )}

      {topNodes.length > 0 && (
        <p className="text-center text-[10px]" style={{ color: 'var(--color-muted)' }}>
          {nodes.length} topics · {edges.length} connections
        </p>
      )}
    </div>
  );
}
