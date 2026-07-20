/**
 * Provider Health Types — Shared Type Layer
 * ==========================================
 * QA-H-009: ProviderHealthRecord moved from components/ to lib/types/
 * so that lib/ never depends on components/.
 *
 * These types represent the shape of GET /api/providers/health responses.
 * Provider names in these records are INTERNAL ONLY and must never be
 * rendered in user-facing UI.
 *
 * @since v0.5.0 Phase H Remediation
 */

export type ProviderHealthStatus = 'healthy' | 'degraded' | 'unhealthy' | 'unknown';

export interface ProviderHealthRecord {
  /** Internal only — NEVER rendered in the UI. */
  provider:        string;
  status:          ProviderHealthStatus;
  circuit_state:   'closed' | 'open' | 'half-open';
  success_rate:    number;
  avg_latency_ms:  number;
}

export interface ProviderHealthResponse {
  providers:  ProviderHealthRecord[];
  checked_at: string;
}
