/**
 * PCOS Neural Intelligence Engine v1 — Telemetry Foundation
 * ============================================================
 * Emits structured telemetry signals to the EventBus for future processing
 * by the Neural Intelligence Engine v2 (G4 — planned).
 *
 * Phase H (v0.5.0): Telemetry collection only.
 * G4 will add the processing layer that consumes these signals to produce
 * routing adjustments, preference models, and optimisation recommendations.
 *
 * Critical invariants:
 * - NEVER blocks the calling context (fire-and-forget only)
 * - NEVER throws — all errors are swallowed silently
 * - NEVER exposes provider names in emitted payloads
 * - NEVER persists data directly — uses EventBus only
 *
 * @since v0.5.0 Phase H
 * @owner Lead Frontend Architect
 */

// Dynamic import to avoid circular dependency with frozen event-bus
// The eventBus is imported lazily to prevent issues if the module is not available
// in client-side contexts.

/** Signal types emitted by the NIE telemetry foundation. */
export interface NIETelemetrySignal {
  /** The classification of this signal. */
  type: 'memory_hit' | 'memory_miss' | 'ux_state' | 'session_active';
  /** Arbitrary structured payload — shapes vary by type. */
  payload: Record<string, unknown>;
  /** ISO 8601 timestamp when the signal was emitted. */
  timestamp: string;
}

/**
 * Emits a telemetry signal to the EventBus.
 * Imported lazily to avoid issues in edge/client contexts.
 * All errors are swallowed — telemetry must never affect user experience.
 */
async function emitSignal(event: string, payload: Record<string, unknown>): Promise<void> {
  try {
    // Dynamic import: EventBus is a server-side singleton in lib/events/
    // This pattern avoids bundling the EventBus in client components.
    const { eventBus } = await import('@/lib/events/event-bus');
    eventBus.emit(event, payload);
  } catch {
    // Intentionally silent — telemetry must never throw
  }
}

/**
 * NIE Telemetry singleton.
 * All Phase H components that interact with intelligence results
 * call these methods to feed the learning foundation.
 */
export const nieTelemetry = {
  /**
   * Records a successful memory hit — the intelligence layer answered
   * from memory without invoking an AI provider (skip_ai = true).
   *
   * @param tokensSaved - Estimated tokens saved by the memory hit.
   */
  recordMemoryHit(tokensSaved: number): void {
    void emitSignal('nie.memory_hit', {
      tokens_saved: tokensSaved,
      ts: new Date().toISOString(),
    });
  },

  /**
   * Records a memory miss — the intelligence layer could not answer
   * from memory and invoked an AI provider.
   */
  recordMemoryMiss(): void {
    void emitSignal('nie.memory_miss', {
      ts: new Date().toISOString(),
    });
  },

  /**
   * Records the UXState observed during an intelligence interaction.
   * Used to build usage pattern models.
   *
   * @param state - The UXState value (from lib/constants/ux-labels.ts).
   *                Never a provider name — only cognitive mode strings.
   */
  recordUXState(state: string): void {
    void emitSignal('nie.ux_state', {
      state,
      ts: new Date().toISOString(),
    });
  },

  /**
   * Records that a user session is active.
   * Used for engagement and session duration modelling.
   */
  recordSessionActive(): void {
    void emitSignal('nie.session_active', {
      ts: new Date().toISOString(),
    });
  },
} as const;
