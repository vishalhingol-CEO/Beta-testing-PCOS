/**
 * PCOS Workflow Types
 * ====================
 * Type definitions for the 5-layer intelligence pipeline workflow.
 * Phase H: Static scaffold types only.
 * Phase v0.8: Live workflow execution will implement these interfaces.
 *
 * G4 extension points are defined but not implemented.
 * They are typed as `never` or optional undefined to prevent accidental use.
 *
 * @since v0.5.0 Phase H
 * @owner Lead Frontend Architect
 */

/** Status of a single workflow stage in the 5-layer pipeline. */
export type WorkflowStageStatus =
  | 'idle'               // Not yet started
  | 'active'             // Currently executing
  | 'complete'           // Finished successfully
  | 'error'              // Failed with error
  | 'skipped'            // Bypassed (e.g., skip_ai short-circuit)
  | 'awaiting_approval'; // G4 — human-in-the-loop approval gate

/** A single stage in the 5-layer PCOS intelligence pipeline. */
export interface WorkflowStage {
  /** Unique identifier for this stage (e.g., 'l1', 'l2'). */
  id: string;
  /** Display name shown in the workflow visualizer. */
  name: string;
  /** Human-readable description of what this stage does. */
  description: string;
  /** Which pipeline layer this stage represents (1–5). */
  layer: 1 | 2 | 3 | 4 | 5;
  /** Current execution status. */
  status: WorkflowStageStatus;
  /** Execution latency in milliseconds — present after completion. */
  latency_ms?: number;
  /** Token count consumed by this stage — present after completion. */
  tokens?: number;
  /**
   * G4 extension: multi-agent assignment.
   * Populated in v0.7 when agents are introduced.
   * Phase H: always undefined.
   */
  agentId?: string;
  /**
   * G4 extension: whether this stage requires human approval before proceeding.
   * Populated in v0.8 when autonomous workflows ship.
   * Phase H: always undefined.
   */
  approvalRequired?: boolean;
  /**
   * G4 extension: approval gate detail when approvalRequired is true.
   * Phase H: always undefined.
   */
  approvalGate?: {
    approvedBy?: string;
    approvedAt?: string;
    message?: string;
  };
}

/** A complete workflow execution record. */
export interface WorkflowExecution {
  /** Unique execution identifier (UUID). */
  id: string;
  /** Ordered list of all pipeline stages and their outcomes. */
  stages: WorkflowStage[];
  /** Total end-to-end latency in milliseconds. */
  total_latency_ms: number;
  /** Whether this execution was served entirely from memory (skip_ai = true). */
  skip_ai: boolean;
  /** Estimated tokens saved by skip_ai (present when skip_ai = true). */
  tokens_saved?: number;
  /** ISO 8601 timestamp of when this execution was created. */
  created_at: string;
  /**
   * G4 extension: multi-agent workflow coordination.
   * Typed as `never` to prevent Phase H usage — will be typed properly in v0.7.
   */
  agentWorkflow?: never;
}

/**
 * The standard 5-layer PCOS pipeline stage definitions.
 * Status is omitted here — it is applied at render time based on live data.
 */
export const PCOS_PIPELINE_STAGES: Omit<WorkflowStage, 'status'>[] = [
  {
    id:          'l1',
    name:        'Memory Retrieval',
    description: 'Searching your knowledge for relevant context',
    layer:       1,
  },
  {
    id:          'l2',
    name:        'Policy Check',
    description: 'Verifying usage limits and permissions',
    layer:       2,
  },
  {
    id:          'l3',
    name:        'Capability Mapping',
    description: 'Identifying required intelligence capabilities',
    layer:       3,
  },
  {
    id:          'l4',
    name:        'Intelligence',
    description: 'Generating response from available context',
    layer:       4,
  },
  {
    id:          'l5',
    name:        'Decision Record',
    description: 'Recording decision for future learning',
    layer:       5,
  },
] as const;

// ─────────────────────────────────────────────────────────────────────────────
// ActivityEvent type — shared between lib/ and components/
// Defined here so lib/api/ never imports from components/
// ─────────────────────────────────────────────────────────────────────────────

import type { ActivityEventType } from '@/lib/constants/activity-labels';

export interface ActivityEvent {
  id:        string;
  type:      ActivityEventType;
  timestamp: string;
  meta?:     string;
}
