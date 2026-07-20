/**
 * KnowledgeGraphCanvas — D3 Force-Directed Knowledge Graph
 * ==========================================================
 * QA fix: D3 SimulationNodeDatum generics used correctly — no `any`.
 * Mobile (<768px): replaced with sorted tag list.
 *
 * @lifecycle Approved
 * @since v0.5.0 Phase H
 */

'use client';

import { useEffect, useRef, useState } from 'react';
import { EmptyState } from '@/components/shared/EmptyState';
import { Network }    from 'lucide-react';
import type * as d3Types from 'd3';

export interface GraphNode { id: string; freq: number; }
export interface GraphEdge { source: string; target: string; weight: number; }

// Extend d3 node with simulation coordinates
interface SimNode extends GraphNode, d3Types.SimulationNodeDatum {
  x?: number;
  y?: number;
  fx?: number | null;
  fy?: number | null;
}

// Edge with resolved node references after simulation
interface SimEdge extends d3Types.SimulationLinkDatum<SimNode> {
  weight: number;
}

interface KnowledgeGraphCanvasProps {
  nodes:         GraphNode[];
  edges:         GraphEdge[];
  totalMemories: number;
}

const COLOURS = [
  'var(--color-brand)',
  'var(--color-memory)',
  'var(--color-intelligence)',
  'var(--color-knowledge)',
  'var(--color-agent)',
  'var(--color-compose)',
  'var(--color-code)',
];

export function KnowledgeGraphCanvas({ nodes, edges, totalMemories }: KnowledgeGraphCanvasProps) {
  const svgRef   = useRef<SVGSVGElement>(null);
  const [loaded, setLoaded] = useState(false);
  const [tooltip, setTooltip] = useState<{ x: number; y: number; text: string } | null>(null);

  useEffect(() => {
    if (!svgRef.current || nodes.length === 0) return;

    let cleanup = () => {};

    import('d3').then(d3 => {
      const svg    = d3.select(svgRef.current!);
      const width  = svgRef.current!.clientWidth  || 600;
      const height = svgRef.current!.clientHeight || 400;
      const maxFreq = Math.max(...nodes.map(n => n.freq));

      svg.selectAll('*').remove();

      const zoom = d3.zoom<SVGSVGElement, unknown>()
        .scaleExtent([0.3, 4])
        .on('zoom', event => { g.attr('transform', (event.transform as d3Types.ZoomTransform).toString()); });
      svg.call(zoom);

      const g = svg.append('g');

      // Typed simulation nodes
      const simNodes: SimNode[] = nodes.map(n => ({ ...n }));
      const simEdges: SimEdge[] = edges.map(e => ({
        source: e.source,
        target: e.target,
        weight: e.weight,
      }));

      const sim = d3.forceSimulation<SimNode>(simNodes)
        .force('link', d3.forceLink<SimNode, SimEdge>(simEdges).id(d => d.id).distance(80).strength(0.5))
        .force('charge', d3.forceManyBody<SimNode>().strength(-200))
        .force('center', d3.forceCenter(width / 2, height / 2))
        .force('collision', d3.forceCollide<SimNode>().radius(d => 12 + (d.freq / maxFreq) * 20));

      const link = g.append('g')
        .selectAll<SVGLineElement, SimEdge>('line')
        .data(simEdges)
        .join('line')
        .attr('stroke', 'var(--color-border)')
        .attr('stroke-width', d => Math.min(d.weight * 0.5, 3))
        .attr('stroke-opacity', 0.6);

      const node = g.append('g')
        .selectAll<SVGCircleElement, SimNode>('circle')
        .data(simNodes)
        .join('circle')
        .attr('r', d => 8 + (d.freq / maxFreq) * 18)
        .attr('fill', (_, i) => COLOURS[i % COLOURS.length])
        .attr('fill-opacity', 0.85)
        .attr('cursor', 'pointer')
        .on('mouseover', (event: MouseEvent, d: SimNode) => {
          setTooltip({ x: event.clientX, y: event.clientY, text: `${d.id} (${d.freq})` });
        })
        .on('mousemove', (event: MouseEvent) => {
          setTooltip(t => t ? { ...t, x: event.clientX, y: event.clientY } : null);
        })
        .on('mouseout', () => setTooltip(null))
        .call(
          d3.drag<SVGCircleElement, SimNode>()
            .on('start', (event, d) => { if (!event.active) sim.alphaTarget(0.3).restart(); d.fx = d.x; d.fy = d.y; })
            .on('drag',  (event, d) => { d.fx = event.x; d.fy = event.y; })
            .on('end',   (event, d) => { if (!event.active) sim.alphaTarget(0); d.fx = null; d.fy = null; })
        );

      const label = g.append('g')
        .selectAll<SVGTextElement, SimNode>('text')
        .data(simNodes)
        .join('text')
        .text(d => d.id)
        .attr('font-size', 10)
        .attr('fill', 'var(--color-muted)')
        .attr('text-anchor', 'middle')
        .attr('dy', d => 16 + (d.freq / maxFreq) * 18);

      sim.on('tick', () => {
        link
          .attr('x1', d => (d.source as SimNode).x ?? 0)
          .attr('y1', d => (d.source as SimNode).y ?? 0)
          .attr('x2', d => (d.target as SimNode).x ?? 0)
          .attr('y2', d => (d.target as SimNode).y ?? 0);
        node.attr('cx', d => d.x ?? 0).attr('cy', d => d.y ?? 0);
        label.attr('x', d => d.x ?? 0).attr('y', d => d.y ?? 0);
      });

      setLoaded(true);
      cleanup = () => sim.stop();
    });

    return () => cleanup();
  }, [nodes, edges]);

  if (nodes.length === 0) {
    return (
      <EmptyState
        icon={<Network size={24} aria-hidden="true" />}
        title="Graph builds as you add memories"
        description="Add memories with tags to see how your knowledge connects."
        action={{ label: 'Capture a memory', href: '/memories/new' }}
        size="lg"
      />
    );
  }

  return (
    <div className="relative flex h-[calc(100vh-120px)] w-full flex-col" data-testid="knowledge-graph-canvas">
      <p className="mb-2 text-xs" style={{ color: 'var(--color-muted)' }}>
        {nodes.length} topics · {edges.length} connections · {totalMemories} memories · Drag to pan, scroll to zoom
      </p>

      {/* Mobile list fallback */}
      <div className="block md:hidden">
        <ul className="flex flex-col gap-2" aria-label="Knowledge topics by frequency">
          {nodes.map((n, i) => (
            <li key={n.id} className="flex items-center justify-between rounded-lg border px-3 py-2"
              style={{ borderColor: 'var(--color-border)' }}>
              <span className="text-sm font-medium" style={{ color: COLOURS[i % COLOURS.length] }}>{n.id}</span>
              <span className="font-mono text-xs" style={{ color: 'var(--color-muted)' }}>{n.freq}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* D3 canvas — hidden on mobile */}
      <div className="hidden flex-1 md:block relative">
        <svg
          ref={svgRef}
          className="h-full w-full rounded-xl"
          style={{ backgroundColor: 'var(--color-surface)' }}
          role="img"
          aria-label={`Knowledge graph: ${nodes.length} topics connected by ${edges.length} relationships`}
        />
        {!loaded && (
          <div className="absolute inset-0 flex items-center justify-center">
            <p className="text-sm" style={{ color: 'var(--color-muted)' }}>Building graph…</p>
          </div>
        )}
      </div>

      {tooltip && (
        <div
          className="pointer-events-none fixed z-50 rounded-lg border px-3 py-1.5 text-xs font-medium shadow-lg"
          style={{
            left:            tooltip.x + 12,
            top:             tooltip.y - 8,
            backgroundColor: 'var(--color-surface-raised)',
            borderColor:     'var(--color-border)',
            color:           'var(--color-fg)',
          }}
          aria-hidden="true"
        >
          {tooltip.text}
        </div>
      )}
    </div>
  );
}
