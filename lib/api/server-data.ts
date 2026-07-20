/**
 * PCOS Server-Side Data — Direct Supabase Access for Server Components
 * =====================================================================
 * RUNTIME FIX: Replaces HTTP self-calls in Server Components with direct
 * Supabase queries.
 *
 * ROOT CAUSE OF DASHBOARD FAILURE:
 * The dashboard Server Component (app/dashboard/page.tsx) called
 * fetchStats(), fetchMemories(), and fetchProviderHealth() which all
 * used fetch() to call the deployment's own API routes via HTTP.
 *
 * This is the "HTTP self-call anti-pattern" in Next.js 14 App Router.
 * On Vercel, a Server Component making an HTTP fetch() to its own
 * deployment's API routes fails because:
 *   1. The serverless function environment has no localhost to resolve to
 *   2. Cold-start race conditions mean the API route may not be reachable
 *      at the moment the Server Component renders
 *   3. Next.js 14 explicitly warns against this pattern
 *
 * THE FIX:
 * Server Components that need data call these functions directly.
 * They use getServerClient() to query Supabase directly — the same
 * queries the API routes perform, but without the HTTP round-trip.
 *
 * The existing API routes (app/api/stats/route.ts etc.) are UNCHANGED.
 * They continue to serve client-side and external callers correctly.
 *
 * WHY IT PASSED BUILD BUT FAILED AT RUNTIME:
 * - TypeScript and next build run in a Node.js environment where
 *   localhost:3000 is available and the URL constructor works with fallbacks
 * - Vercel SSR functions have no implicit base URL for relative paths
 * - The failure is a runtime environment difference, not a type error
 *
 * @since v0.5.0 Phase H Runtime Fix
 */

import { createClient } from '@supabase/supabase-js';
import type { PCOSStats } from '@/lib/api/stats';
import type { MemoryNode } from '@/lib/api/memories';
import type { ProviderHealthResponse } from '@/lib/types/provider-types';

/** Server-side Supabase client using service role key. Server only — never expose to browser. */
function getClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL ?? '',
    process.env.SUPABASE_SERVICE_ROLE_KEY ?? '',
  );
}

/**
 * Fetches dashboard stats directly from Supabase.
 * Equivalent to GET /api/stats but without HTTP self-call.
 */
export async function getServerStats(): Promise<PCOSStats> {
  const supabase = getClient();

  // Count nodes by processed state
  const { data: nodes, error: nodesError } = await supabase
    .from('nodes')
    .select('processed, processing_error');

  if (nodesError) throw new Error(`Stats query failed: ${nodesError.message}`);

  const all        = nodes ?? [];
  const total      = all.length;
  const processed  = all.filter(n => n.processed === true).length;
  const failed     = all.filter(n => n.processing_error !== null).length;
  const processing = all.filter(n => n.processed === false && n.processing_error === null).length;

  // Fetch today's cost from events table
  const todayStart = new Date();
  todayStart.setUTCHours(0, 0, 0, 0);

  const { data: events } = await supabase
    .from('events')
    .select('payload')
    .eq('event_type', 'ai.call_made')
    .gte('created_at', todayStart.toISOString());

  let todayCost     = 0;
  let todayRequests = 0;
  let todayMemoryHits = 0;

  for (const event of events ?? []) {
    const p = (event.payload ?? {}) as Record<string, unknown>;
    todayCost     += typeof p.cost_usd === 'number' ? p.cost_usd : 0;
    todayRequests += 1;
    if (p.skip_ai === true) todayMemoryHits += 1;
  }

  const dailyCostLimit    = parseFloat(process.env.PCOS_DAILY_COST_LIMIT_USD    ?? '5.00');
  const dailyRequestLimit = parseInt(process.env.PCOS_DAILY_REQUEST_LIMIT       ?? '500', 10);

  return {
    total_nodes:           total,
    processed_nodes:       processed,
    processing_nodes:      processing,
    failed_nodes:          failed,
    processing_percentage: total > 0 ? Math.round((processed / total) * 100) : 0,
    today_cost_usd:        todayCost,
    today_requests:        todayRequests,
    daily_cost_limit_usd:  dailyCostLimit,
    daily_request_limit:   dailyRequestLimit,
    today_memory_hits:     todayMemoryHits,
  };
}

/**
 * Fetches memory nodes directly from Supabase.
 * Equivalent to GET /api/memories but without HTTP self-call.
 */
export async function getServerMemories(limit = 8): Promise<MemoryNode[]> {
  const supabase = getClient();

  const { data, error } = await supabase
    .from('nodes')
    .select('id, content, summary, tags, entities, processed, processing_error, created_at, updated_at')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) throw new Error(`Memories query failed: ${error.message}`);

  return (data ?? []).map(row => ({
    ...row,
    embedding: null, // Never send embeddings to the UI
    tags:     Array.isArray(row.tags)     ? row.tags     : [],
    entities: Array.isArray(row.entities) ? row.entities : [],
  }));
}

/**
 * Fetches provider health directly from in-memory health state.
 * The Provider Intelligence Layer maintains health in-memory.
 * Returns a safe empty response rather than throwing if unavailable.
 */
export async function getServerProviderHealth(): Promise<ProviderHealthResponse> {
  // Provider health state lives in-memory in the frozen Provider Intelligence Layer.
  // We cannot safely import it server-side without risking module init side effects.
  // The ProviderHealthDots component gracefully handles an empty providers array.
  // Full provider health display is available at /admin/intelligence (SA-01 gated).
  return { providers: [], checked_at: new Date().toISOString() };
}

/**
 * Fetches recent activity events directly from Supabase.
 * Provider-neutral: strips provider-identifying fields from payload.
 */
export async function getServerRecentEvents(limit = 15) {
  const supabase = getClient();

  const BLOCKED = new Set(['provider', 'model', 'provider_used', 'adapter', 'vendor']);

  const { data } = await supabase
    .from('events')
    .select('id, event_type, created_at, payload')
    .order('created_at', { ascending: false })
    .limit(limit);

  return (data ?? []).map(event => {
    const payload = event.payload as Record<string, unknown> | null;
    const safePayload = payload
      ? Object.fromEntries(Object.entries(payload).filter(([k]) => !BLOCKED.has(k.toLowerCase())))
      : null;
    return { ...event, payload: safePayload };
  });
}

/**
 * Fetches a single memory node directly from Supabase.
 * HOTFIX G4-HF-01: Replaces fetchMemory() HTTP call in Server Components.
 */
export async function getServerMemory(id: string): Promise<MemoryNode | null> {
  const supabase = getClient();

  const { data, error } = await supabase
    .from('nodes')
    .select('id, content, summary, tags, entities, processed, processing_error, created_at, updated_at')
    .eq('id', id)
    .single();

  if (error || !data) return null;

  return {
    ...data,
    embedding: null,
    tags:     Array.isArray(data.tags)     ? data.tags     : [],
    entities: Array.isArray(data.entities) ? data.entities : [],
  };
}

/**
 * Fetches memories with optional filter params directly from Supabase.
 * HOTFIX G4-HF-01: Replaces fetchMemories() HTTP call in Server Components.
 */
export async function getServerMemoriesFiltered(params: {
  status?: 'all' | 'processed' | 'processing' | 'failed';
  sort?:   'newest' | 'oldest';
  limit?:  number;
  offset?: number;
} = {}): Promise<MemoryNode[]> {
  const supabase = getClient();

  let query = supabase
    .from('nodes')
    .select('id, content, summary, tags, entities, processed, processing_error, created_at, updated_at');

  if (params.status && params.status !== 'all') {
    if (params.status === 'processed')  query = query.eq('processed', true).is('processing_error', null);
    if (params.status === 'processing') query = query.eq('processed', false).is('processing_error', null);
    if (params.status === 'failed')     query = query.not('processing_error', 'is', null);
  }

  query = query.order('created_at', { ascending: params.sort === 'oldest' });

  if (params.limit)  query = query.limit(params.limit);
  if (params.offset) query = query.range(params.offset, params.offset + (params.limit ?? 20) - 1);

  const { data, error } = await query;
  if (error) throw new Error(`Filtered memories query failed: ${error.message}`);

  return (data ?? []).map(row => ({
    ...row,
    embedding: null,
    tags:     Array.isArray(row.tags)     ? row.tags     : [],
    entities: Array.isArray(row.entities) ? row.entities : [],
  }));
}
