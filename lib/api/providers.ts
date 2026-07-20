/**
 * PCOS Provider Health API Client
 * =================================
 * QA-H-009: imports from lib/types/provider-types.ts, not from components/
 * Provider names from this response are NEVER surfaced in user-facing UI.
 *
 * @since v0.5.0 Phase H
 */

import type { ProviderHealthResponse } from '@/lib/types/provider-types';

export type { ProviderHealthRecord, ProviderHealthResponse } from '@/lib/types/provider-types';

// HOTFIX G4-HF-01: Removed BASE/NEXT_PUBLIC_BASE_URL — use relative paths only.

export async function fetchProviderHealth(): Promise<ProviderHealthResponse> {
  const res = await fetch('/api/providers/health', { cache: 'no-store' });
  if (!res.ok) {
    return { providers: [], checked_at: new Date().toISOString() };
  }
  return res.json() as Promise<ProviderHealthResponse>;
}
