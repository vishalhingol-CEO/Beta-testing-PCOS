/**
 * PCOS Activity Labels — Single Source of Truth
 * ===============================================
 * All activity feed event display labels are defined here.
 * Provider-neutral. No provider names permitted anywhere in this file.
 *
 * @since v0.5.0 Phase H
 * @owner Lead Frontend Architect
 */

import type { LucideIcon } from 'lucide-react';

/** All recognised activity event types across current and planned PCOS features. */
export type ActivityEventType =
  | 'memory_created'
  | 'memory_processed'
  | 'memory_failed'
  | 'search_performed'
  | 'context_queried'
  | 'skip_ai_event'
  | 'knowledge_updated'
  | 'insight_discovered'
  | 'workflow_completed'   // future v0.8
  | 'task_completed'       // future v0.7
  | 'document_analyzed';   // future v0.9

/** User-facing label for each activity event type. */
export const ACTIVITY_LABELS: Record<ActivityEventType, string> = {
  memory_created:      'Memory captured',
  memory_processed:    'Memory indexed',
  memory_failed:       'Processing failed',
  search_performed:    'Search completed',
  context_queried:     'Intelligence queried',
  skip_ai_event:       'Answered from memory',
  knowledge_updated:   'Knowledge graph updated',
  insight_discovered:  'Insight discovered',
  workflow_completed:  'Workflow completed',
  task_completed:      'Task completed',
  document_analyzed:   'Document analyzed',
} as const;

/**
 * Semantic icon name for each activity event type.
 * Resolved to Lucide components in ActivityFeedItem.tsx.
 * Kept as string keys here to avoid importing lucide-react in constants.
 */
export const ACTIVITY_ICON_KEYS: Record<ActivityEventType, string> = {
  memory_created:      'Brain',
  memory_processed:    'CheckCircle2',
  memory_failed:       'XCircle',
  search_performed:    'Search',
  context_queried:     'Zap',
  skip_ai_event:       'BookMarked',
  knowledge_updated:   'Network',
  insight_discovered:  'Sparkles',
  workflow_completed:  'CheckCircle2',
  task_completed:      'CheckCircle2',
  document_analyzed:   'FileText',
} as const;

/**
 * Semantic colour variable for each activity event type.
 * References CSS custom properties — no hardcoded hex.
 */
export const ACTIVITY_COLOURS: Record<ActivityEventType, string> = {
  memory_created:      'var(--color-brand)',
  memory_processed:    'var(--color-success)',
  memory_failed:       'var(--color-danger)',
  search_performed:    'var(--color-intelligence)',
  context_queried:     'var(--color-brand)',
  skip_ai_event:       'var(--color-memory)',
  knowledge_updated:   'var(--color-knowledge)',
  insight_discovered:  'var(--color-compose)',
  workflow_completed:  'var(--color-success)',
  task_completed:      'var(--color-success)',
  document_analyzed:   'var(--color-knowledge)',
} as const;
