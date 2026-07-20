/**
 * PCOS Stats API Client
 * ======================
 * Centralised client for GET /api/stats.
 * Used by the dashboard panels: MemoryHealth, AIUsage, IntelligenceOrb.
 *
 * @since v0.5.0 Phase H
 */

// HOTFIX G4-HF-01: Removed BASE/NEXT_PUBLIC_BASE_URL — use relative paths only.

export interface PCOSStats {
  /** Total memory nodes in the database. */
  total_nodes:           number;
  /** Nodes that have been fully processed (embedding + enrichment). */
  processed_nodes:       number;
  /** Nodes currently in the pipeline. */
  processing_nodes:      number;
  /** Nodes that failed processing. */
  failed_nodes:          number;
  /** Percentage of nodes that are processed (0–100). */
  processing_percentage: number;
  /** Estimated AI spend today in USD. */
  today_cost_usd:        number;
  /** Number of AI requests made today. */
  today_requests:        number;
  /** Daily cost limit in USD (from env). */
  daily_cost_limit_usd:  number;
  /** Daily request limit (from env). */
  daily_request_limit:   number;
  /** Tokens used today (input + output). */
  today_tokens?:         number;
  /** Requests answered from memory (skip_ai=true) today. */
  today_memory_hits?:    number;
  /** Estimated tokens saved by memory hits today. */
  today_tokens_saved?:   number;
}

export async function fetchStats(): Promise<PCOSStats> {
  const res = await fetch('/api/stats', { cache: 'no-store' });
  if (!res.ok) {
    throw new Error(`Failed to fetch stats: HTTP ${res.status}`);
  }
  return res.json() as Promise<PCOSStats>;
}
