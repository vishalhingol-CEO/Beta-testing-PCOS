/**
 * PCOS G4 Extension Hooks — Foundation Definitions
 * ==================================================
 * Interface definitions for Generation 4+ capabilities.
 * Phase H: DEFINED ONLY. These interfaces are NOT implemented.
 *
 * These types establish the extension contract that G4 implementations
 * will satisfy. They exist in Phase H so that:
 * 1. TypeScript catches any Phase H code that accidentally tries to use G4 features
 * 2. G4 engineers have a clear, approved API surface to implement against
 * 3. The architecture commitment is recorded in the codebase from day one
 *
 * Implementation note: All methods return Promise<never> or throw in Phase H.
 * Do not call these interfaces in Phase H components.
 *
 * @since v0.5.0 Phase H
 * @owner Lead Frontend Architect
 * @g4-target v1.0+ — Generation 4 Neural Intelligence Engine v2
 */

// ─────────────────────────────────────────────────────────────────────────────
// G4 Extension Point: Prompt Optimization
// ─────────────────────────────────────────────────────────────────────────────

/**
 * G4: Optimize prompts based on learned user patterns and provider performance.
 * Phase H: defined, not implemented.
 * G4 implementation will produce lower token usage and higher quality responses
 * by adapting prompt structure to individual user cognitive patterns.
 */
export interface PromptOptimizationHook {
  /**
   * Returns an optimized version of the given prompt based on historical
   * performance data for this user and capability type.
   *
   * @param rawPrompt  - The original user input or assembled prompt
   * @param capability - The target capability (reasoning, coding, etc.)
   * @returns Optimized prompt string
   */
  optimizePrompt(rawPrompt: string, capability: string): Promise<string>;

  /**
   * Records the outcome of a prompt/response pair for future optimization.
   * @param promptHash - Deterministic hash of the prompt
   * @param quality    - Outcome quality score (0.0–1.0)
   */
  recordOutcome(promptHash: string, quality: number): Promise<void>;
}

// ─────────────────────────────────────────────────────────────────────────────
// G4 Extension Point: Advanced Token Analytics
// ─────────────────────────────────────────────────────────────────────────────

/**
 * G4: Advanced analysis of token usage patterns for cost and efficiency optimization.
 * Phase H: defined, not implemented.
 */
export interface AdvancedTokenAnalyticsHook {
  /**
   * Returns a forecast of token usage for the next N days based on
   * historical consumption patterns.
   *
   * @param days - Forecast horizon in days (default: 30)
   */
  forecastUsage(days?: number): Promise<{ date: string; estimated_tokens: number }[]>;

  /**
   * Returns the top opportunities to reduce token usage without
   * degrading response quality.
   */
  getOptimizationOpportunities(): Promise<{ description: string; estimated_savings: number }[]>;
}

// ─────────────────────────────────────────────────────────────────────────────
// G4 Extension Point: Knowledge Graph 2.0
// ─────────────────────────────────────────────────────────────────────────────

/**
 * G4: Entity-level knowledge graph with semantic edge weights.
 * Phase H: tag co-occurrence graph only.
 * G4: Full entity extraction, relationship classification, semantic edge weights.
 */
export interface KnowledgeGraph20Hook {
  /**
   * Extracts named entities from memory content.
   * Phase H uses tag-level relationships only.
   * G4 will extract persons, organisations, concepts, dates, locations.
   *
   * @param content - Raw memory content
   */
  extractEntities(content: string): Promise<unknown>;

  /**
   * Computes a semantic edge weight between two knowledge graph nodes.
   * Returns 0.0–1.0 where 1.0 = maximally related.
   *
   * @param nodeA - First node identifier
   * @param nodeB - Second node identifier
   */
  computeSemanticEdgeWeight(nodeA: string, nodeB: string): Promise<number>;
}

// ─────────────────────────────────────────────────────────────────────────────
// G4 Extension Point: Self-Learning Workflow Telemetry
// ─────────────────────────────────────────────────────────────────────────────

/**
 * G4: Provider score adjustment based on outcome feedback.
 * Phase H: aggregate efficiency percentage in AIUsagePanel only.
 * G4: Dynamic provider score adjustment based on continuous outcome learning.
 */
export interface SelfLearningWorkflowHook {
  /**
   * Records the quality outcome of a workflow execution.
   * Used to adjust provider selection scoring over time.
   *
   * @param workflowId - UUID of the completed workflow execution
   * @param quality    - Outcome quality score (0.0–1.0)
   */
  recordOutcome(workflowId: string, quality: number): Promise<void>;

  /**
   * Returns the learned score adjustment for a specific provider.
   * Positive adjustment = performs above baseline for this user.
   * Negative adjustment = performs below baseline for this user.
   *
   * @param provider - Provider identifier (internal, not user-facing)
   */
  getProviderAdjustment(provider: string): Promise<number>;
}

// ─────────────────────────────────────────────────────────────────────────────
// G4 Extension Point: Design Intelligence
// ─────────────────────────────────────────────────────────────────────────────

/**
 * G4: UI adapts to user cognitive patterns and knowledge graph activity.
 * Phase H: defined only — no adaptive UI behaviour is implemented.
 * G4: Dashboard layout, panel ordering, and information density adapt to
 * individual usage patterns.
 */
export interface DesignIntelligenceHook {
  /**
   * Returns the user's inferred layout preference based on usage patterns.
   * Phase H: always returns null.
   *
   * @param userId - User identifier (available in v0.6+)
   */
  getLayoutPreference(userId: string): Promise<unknown>;

  /**
   * Records a cognitive pattern signal for future layout adaptation.
   *
   * @param signal - Arbitrary usage signal payload
   */
  updateCognitivePattern(signal: unknown): Promise<void>;
}

// ─────────────────────────────────────────────────────────────────────────────
// G4 Extension Point: Neural Intelligence Engine v2
// ─────────────────────────────────────────────────────────────────────────────

/**
 * G4: Neural Intelligence Engine v2 — predictive intelligence foundation.
 * Phase H (NIE v1): telemetry collection only via lib/telemetry/nie-telemetry.ts.
 * G4 (NIE v2): predictive workflow selection, autonomous optimisation,
 *              intelligent recommendations.
 *
 * This interface is the approved API surface for G4 NIE v2 implementation.
 * Phase H engineers: do not implement this. Use nieTelemetry for v1 signals.
 */
export interface NeuralIntelligenceEngineV2Hook {
  /**
   * Predicts the most appropriate workflow template for a given intent.
   * G4 only — Phase H returns null.
   */
  predictWorkflow(intent: string): Promise<unknown>;

  /**
   * Returns proactive suggestions for the user based on their knowledge
   * graph activity and historical patterns.
   * G4 only — Phase H returns empty array.
   */
  getSuggestions(): Promise<unknown[]>;
}
