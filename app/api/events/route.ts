/**
 * GET /api/events — Recent activity events
 * ==========================================
 * QA-H-007: New non-frozen API route for ActivityFeed.
 * Returns recent events from the `events` table.
 *
 * PROVIDER NEUTRALITY: `provider_used` and `model` fields are excluded
 * from the response. Only event_type, id, created_at, and safe payload
 * fields are returned.
 *
 * FROZEN FILE SAFETY: This file is NEW. It does not modify any frozen
 * backend file. It uses the existing getServerClient() boundary.
 *
 * @since v0.5.0 Phase H Remediation — QA-H-007
 */

import { NextResponse } from 'next/server';

// Dynamically import getServerClient to avoid issues in edge environments
async function getClient() {
  const { getServerClient } = await import('@/lib/db/client');
  return getServerClient();
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const limit = Math.min(parseInt(searchParams.get('limit') ?? '15', 10), 50);

  try {
    const supabase = await getClient();

    const { data, error } = await supabase
      .from('events')
      .select('id, event_type, created_at, payload')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      return NextResponse.json({ data: [] }, { status: 200 });
    }

    // Strip provider-identifying fields from payload before returning
    const safe = (data ?? []).map((event: Record<string, unknown>) => ({
      id:         event.id,
      event_type: event.event_type,
      created_at: event.created_at,
      // Only forward provider-neutral payload fields
      payload: event.payload
        ? sanitizePayload(event.payload as Record<string, unknown>)
        : null,
    }));

    return NextResponse.json({ data: safe });
  } catch {
    return NextResponse.json({ data: [] }, { status: 200 });
  }
}

/** Remove any payload keys that could reveal provider/model identity */
function sanitizePayload(payload: Record<string, unknown>): Record<string, unknown> {
  const BLOCKED = new Set(['provider', 'model', 'provider_used', 'adapter', 'vendor']);
  return Object.fromEntries(
    Object.entries(payload).filter(([k]) => !BLOCKED.has(k.toLowerCase()))
  );
}
