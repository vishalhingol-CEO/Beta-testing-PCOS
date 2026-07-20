/**
 * PCOS UX Labels — Single Source of Truth
 * =========================================
 * ALL user-facing intelligence state copy is defined here.
 * NO component may define these strings inline.
 * PROVIDER NAMES MUST NEVER APPEAR IN THIS FILE OR ANY USER-FACING FILE.
 *
 * This file is the canonical implementation of Constitution Law 2
 * (Provider Independence) and CTO Directive 10 (UXState Copy From Single Source).
 *
 * @since v0.5.0 Phase H
 * @owner Lead Frontend Architect
 */

// UXState is defined in lib/intelligence/intelligence-types.ts
// We redeclare the type here so this file has zero dependency on the
// frozen intelligence layer — it can be imported anywhere safely.
export type UXState =
  | 'thinking'
  | 'recalling'
  | 'coding'
  | 'planning'
  | 'writing'
  | 'researching';

/**
 * Maps every UXState value to the exact user-facing label shown in the UI.
 * Canonical per Constitution Law 2 and CTO Directive 10.
 */
export const UX_STATE_LABELS: Record<UXState, string> = {
  thinking:    'Working on it...',
  recalling:   'Recalling...',
  coding:      'Writing code...',
  planning:    'Planning...',
  writing:     'Composing...',
  researching: 'Researching...',
} as const;

/** Shown when intelligence is idle and ready. */
export const UX_STATE_IDLE_LABEL = 'Ready' as const;

/** Shown when intelligence encounters an unrecoverable error. */
export const UX_STATE_ERROR_LABEL = 'System error' as const;

/** Shown when a response was served entirely from memory (skip_ai = true). */
export const MEMORY_RECALL_LABEL = 'Answered from memory' as const;

/** Shown when a response required AI processing. */
export const AI_PROCESSING_LABEL = 'Analyzed with AI' as const;

/** Shown while a memory is being embedded and enriched by the pipeline. */
export const PROCESSING_LABEL = 'Indexing...' as const;

/** Shown when a memory has been fully processed and indexed. */
export const MEMORY_INDEXED_LABEL = 'Memory indexed' as const;

/** Shown when a new memory is created by the user. */
export const MEMORY_CAPTURED_LABEL = 'Memory captured' as const;

/** Shown when a search query completes. */
export const SEARCH_COMPLETE_LABEL = 'Search completed' as const;

/** Shown when the intelligence pipeline is invoked. */
export const CONTEXT_QUERIED_LABEL = 'Intelligence queried' as const;

/** Shown when the knowledge graph structure is updated. */
export const KNOWLEDGE_UPDATED_LABEL = 'Knowledge graph updated' as const;

/** Shown when the system surfaces a pattern or connection. */
export const INSIGHT_FOUND_LABEL = 'Insight discovered' as const;

/** Shown when an autonomous workflow completes (v0.8). */
export const WORKFLOW_DONE_LABEL = 'Workflow completed' as const;

// ─────────────────────────────────────────────────────────────────────────────
// Similarity vocabulary — maps semantic score ranges to user-friendly labels.
// Raw decimal scores (0.87, 0.62…) are never shown to users.
// ─────────────────────────────────────────────────────────────────────────────

export const SIMILARITY_LABELS = {
  excellent: { min: 0.90, label: 'Excellent match' },
  good:      { min: 0.75, label: 'Good match'      },
  partial:   { min: 0.55, label: 'Partial match'   },
  weak:      { min: 0.00, label: 'Weak match'      },
} as const;

/**
 * Converts a semantic similarity score (0.0–1.0) to a user-friendly label.
 * Never exposes the raw decimal to the UI.
 */
export function getSimilarityLabel(score: number): string {
  if (score >= SIMILARITY_LABELS.excellent.min) return SIMILARITY_LABELS.excellent.label;
  if (score >= SIMILARITY_LABELS.good.min)      return SIMILARITY_LABELS.good.label;
  if (score >= SIMILARITY_LABELS.partial.min)   return SIMILARITY_LABELS.partial.label;
  return SIMILARITY_LABELS.weak.label;
}

/**
 * Returns the colour CSS variable for a similarity score.
 * Maps to semantic colour tokens — never hardcoded hex.
 */
export function getSimilarityColour(score: number): string {
  if (score >= SIMILARITY_LABELS.excellent.min) return 'var(--color-success)';
  if (score >= SIMILARITY_LABELS.good.min)      return 'var(--color-intelligence)';
  if (score >= SIMILARITY_LABELS.partial.min)   return 'var(--color-agent)';
  return 'var(--color-muted)';
}

// ─────────────────────────────────────────────────────────────────────────────
// Processing pipeline stage labels — used in ProcessingTimeline
// ─────────────────────────────────────────────────────────────────────────────

export const PIPELINE_STAGE_LABELS = {
  created:   'Created',
  embedding: 'Embedding',
  enriched:  'Enriched',
  indexed:   'Indexed',
} as const;

export type PipelineStage = keyof typeof PIPELINE_STAGE_LABELS;
