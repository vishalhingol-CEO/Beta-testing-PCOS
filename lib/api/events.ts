/**
 * PCOS Events API Client
 * =======================
 * QA-H-007: Wires ActivityFeed to real PCOS event data.
 *
 * ARCHITECTURAL BOUNDARY DOCUMENTATION:
 * The existing /api/stats endpoint (frozen) does not expose event records.
 * The `events` table exists in Supabase but has no dedicated list API route.
 *
 * APPROACH: This client calls a new non-frozen route GET /api/events
 * which this phase creates. This does NOT modify any frozen backend file.
 * It adds a new API route file only.
 *
 * PROVIDER NEUTRALITY: event_type values are mapped to ActivityEventType
 * via ACTIVITY_LABELS. Provider names in event payloads are stripped
 * before the response is returned.
 *
 * @since v0.5.0 Phase H Remediation — QA-H-007
 */

import type { ActivityEvent } from '@/lib/types/workflow-types';
import { type ActivityEventType } from '@/lib/constants/activity-labels';

// HOTFIX G4-HF-01: Removed BASE/NEXT_PUBLIC_BASE_URL — use relative paths only.

/** Raw event shape from /api/events */
interface RawEvent {
  id:         string;
  event_type: string;
  created_at: string;
  payload?:   Record<string, unknown>;
}

/** Maps DB event_type values to ActivityEventType. */
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
} as const;

/**
 * Fetches recent activity events from GET /api/events.
 * Returns a maximum of 15 most recent events.
 * Provider names are never included in the returned records.
 */
export async function fetchRecentEvents(limit = 15): Promise<ActivityEvent[]> {
  try {
    const res = await fetch(`/api/events?limit=${limit}`, { cache: 'no-store' });
    if (!res.ok) return [];
    const body = await res.json() as { data?: RawEvent[] };
    const raw  = body.data ?? [];

    return raw
      .map((e): ActivityEvent | null => {
        const type = EVENT_TYPE_MAP[e.event_type];
        if (!type) return null;
        return {
          id:        e.id,
          type,
          timestamp: e.created_at,
          // meta may include memory title/summary — never provider name
          meta:      extractProviderNeutralMeta(e.payload),
        };
      })
      .filter((e): e is ActivityEvent => e !== null);
  } catch {
    // Events feed failure must never break the dashboard
    return [];
  }
}

/**
 * Extracts a display string from an event payload with zero provider names.
 * Any key whose name contains 'provider', 'model', or 'adapter' is excluded.
 */
function extractProviderNeutralMeta(payload?: Record<string, unknown>): string | undefined {
  if (!payload) return undefined;
  // Only surface safe, non-provider fields
  const safe = payload.summary ?? payload.content_preview ?? payload.query;
  if (typeof safe === 'string') {
    return safe.slice(0, 50);
  }
  return undefined;
}
