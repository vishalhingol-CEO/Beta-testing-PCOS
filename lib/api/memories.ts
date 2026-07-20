/**
 * PCOS Memory API Client
 * =======================
 * All memory-related API calls are centralised here.
 * Components NEVER call fetch() directly or import supabase.
 * All routes are consumed through this module.
 *
 * HOTFIX G4-HF-01 (2026-07-20):
 * Removed BASE / NEXT_PUBLIC_BASE_URL entirely.
 *
 * ROOT CAUSE: new URL(path, BASE || 'http://localhost:3000') fell back to
 * localhost when NEXT_PUBLIC_BASE_URL was undefined (env var name mismatch —
 * Vercel uses NEXT_PUBLIC_APP_URL, not NEXT_PUBLIC_BASE_URL). Client
 * components built absolute URLs pointing to http://localhost:3000/api/...
 * which returns ERR_CONNECTION_REFUSED in production.
 *
 * FIX: Use relative paths directly. The browser resolves '/api/memories'
 * against the current origin automatically — always correct in every
 * environment without any configuration.
 *
 * SERVER COMPONENTS: Do not call these functions from Server Components.
 * Per ADR-G4-001, Server Components use getServerMemories() from
 * lib/api/server-data.ts which queries Supabase directly.
 *
 * @since v0.5.0 Phase H
 * @updated v0.6.0 G4-HF-01 — removed localhost URL builder
 */

export interface MemoryNode {
  id:               string;
  content:          string;
  summary:          string | null;
  tags:             string[];
  entities:         string[];
  embedding:        number[] | null;
  processed:        boolean;
  processing_error: string | null;
  created_at:       string;
  updated_at:       string;
}

export interface SearchResult extends MemoryNode {
  similarity: number;
}

export interface MemoryQueryParams {
  status?: 'all' | 'processed' | 'processing' | 'failed';
  sort?:   'newest' | 'oldest';
  limit?:  number;
  offset?: number;
}

export interface CreateMemoryInput {
  content: string;
  tags?:   string[];
}

export interface UpdateMemoryInput {
  content?: string;
  tags?:    string[];
}

/**
 * Builds a relative URL for an API path.
 * Relative paths are resolved by the browser against the current origin —
 * correct in every environment (dev, staging, production) without configuration.
 */
function url(path: string, params?: Record<string, string | number | undefined>): string {
  if (!params) return path;

  const query = Object.entries(params)
    .filter(([, v]) => v !== undefined)
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`)
    .join('&');

  return query ? `${path}?${query}` : path;
}

/** Handles a fetch response, throwing with the server error message on failure. */
async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const body = await res.json().catch(() => ({ message: `HTTP ${res.status}` }));
    throw new Error((body as { message?: string }).message ?? `HTTP ${res.status}`);
  }
  return res.json() as Promise<T>;
}

/** GET /api/memories — list memories with optional filters */
export async function fetchMemories(params: MemoryQueryParams = {}): Promise<MemoryNode[]> {
  const res = await fetch(url('/api/memories', {
    status: params.status !== 'all' ? params.status : undefined,
    sort:   params.sort,
    limit:  params.limit,
    offset: params.offset,
  }), { cache: 'no-store' });

  const body = await handleResponse<{ data: MemoryNode[] }>(res);
  return body.data;
}

/** GET /api/memories/[id] — single memory */
export async function fetchMemory(id: string): Promise<MemoryNode | null> {
  const res = await fetch(url(`/api/memories/${id}`), { cache: 'no-store' });
  if (res.status === 404) return null;
  const body = await handleResponse<{ data: MemoryNode }>(res);
  return body.data;
}

/** POST /api/memories — create memory */
export async function createMemory(input: CreateMemoryInput): Promise<MemoryNode> {
  const res = await fetch('/api/memories', {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify(input),
  });
  const body = await handleResponse<{ data: MemoryNode }>(res);
  return body.data;
}

/** PATCH /api/memories/[id] — update memory */
export async function updateMemory(id: string, input: UpdateMemoryInput): Promise<MemoryNode> {
  const res = await fetch(`/api/memories/${id}`, {
    method:  'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify(input),
  });
  const body = await handleResponse<{ data: MemoryNode }>(res);
  return body.data;
}

/** DELETE /api/memories/[id] — delete memory */
export async function deleteMemory(id: string): Promise<void> {
  const res = await fetch(`/api/memories/${id}`, { method: 'DELETE' });
  await handleResponse<unknown>(res);
}

/** GET /api/memories/search?q= — semantic search */
export async function searchMemories(query: string, limit = 20): Promise<SearchResult[]> {
  const res = await fetch(url('/api/memories/search', { q: query, limit }), {
    cache: 'no-store',
  });
  const body = await handleResponse<{ data: SearchResult[] }>(res);
  return body.data;
}
