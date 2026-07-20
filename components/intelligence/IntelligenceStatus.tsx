/**
 * IntelligenceStatus — Canonical UXState Visual Component
 * =========================================================
 * The single canonical component for surfacing AI system state.
 * All other Phase H components that need to show intelligence activity
 * import and use this. NEVER re-implement elsewhere.
 *
 * Provider names NEVER appear here. UXState labels from lib/constants/ux-labels.ts only.
 * Constitution Law 2 (Provider Independence) is enforced at this component boundary.
 *
 * @param state        - Current UXState, 'idle', or 'error'
 * @param size         - Visual size variant
 * @param showLabel    - Whether to show the text label (default: true)
 * @param showAnimation - Whether to animate (respects prefers-reduced-motion)
 * @param label        - Override label from UX_STATE_LABELS
 * @param subLabel     - Secondary info (e.g., token savings)
 * @param className    - Additional CSS classes
 *
 * @lifecycle Approved
 * @since v0.5.0 Phase H
 * @owner Lead Frontend Architect
 */
'use client';
// Reason: uses CSS animations and refs for reduced-motion detection

import { useEffect, useState } from 'react';
import {
  UX_STATE_LABELS,
  UX_STATE_IDLE_LABEL,
  UX_STATE_ERROR_LABEL,
  type UXState,
} from '@/lib/constants/ux-labels';

/* ── Types ──────────────────────────────────────────────────────────────── */

type IntelligenceState = UXState | 'idle' | 'error';
type StatusSize = 'xs' | 'sm' | 'md' | 'lg';

export interface IntelligenceStatusProps {
  /** Current intelligence state. */
  state: IntelligenceState;
  /** Visual size variant. Default: 'md'. */
  size?: StatusSize;
  /** Show the text label alongside the dot. Default: true. */
  showLabel?: boolean;
  /** Show animation (always overridden by prefers-reduced-motion). Default: true. */
  showAnimation?: boolean;
  /** Override the label from UX_STATE_LABELS. */
  label?: string;
  /** Secondary info shown below/after the label (e.g., "0 tokens used"). */
  subLabel?: string;
  /** Additional CSS classes applied to the root element. */
  className?: string;
}

/* ── State Configuration ────────────────────────────────────────────────── */

interface StateConfig {
  label:       string;
  colour:      string;
  animation:   string;
  ariaLabel:   string;
}

const STATE_CONFIG: Record<IntelligenceState, StateConfig> = {
  idle: {
    label:     UX_STATE_IDLE_LABEL,
    colour:    'var(--color-muted)',
    animation: '',
    ariaLabel: 'Intelligence ready',
  },
  error: {
    label:     UX_STATE_ERROR_LABEL,
    colour:    'var(--color-danger)',
    animation: '',
    ariaLabel: 'Intelligence system error',
  },
  thinking: {
    label:     UX_STATE_LABELS.thinking,
    colour:    'var(--color-brand)',
    animation: 'pcos-pulse-indigo',
    ariaLabel: 'Intelligence is working on a response',
  },
  recalling: {
    label:     UX_STATE_LABELS.recalling,
    colour:    'var(--color-memory)',
    animation: 'pcos-flash-violet',
    ariaLabel: 'Intelligence is recalling from memory',
  },
  coding: {
    label:     UX_STATE_LABELS.coding,
    colour:    'var(--color-code)',
    animation: 'pcos-blink-green',
    ariaLabel: 'Intelligence is writing code',
  },
  planning: {
    label:     UX_STATE_LABELS.planning,
    colour:    'var(--color-agent)',
    animation: 'pcos-ripple-amber',
    ariaLabel: 'Intelligence is planning',
  },
  writing: {
    label:     UX_STATE_LABELS.writing,
    colour:    'var(--color-compose)',
    // 'writing' renders 3 staggered bars in StatusDot — animation applied per-bar
    // using pcos-wave-bar (defined in globals.css). This field is unused for writing.
    animation: 'pcos-wave-bar',
    ariaLabel: 'Intelligence is composing',
  },
  researching: {
    label:     UX_STATE_LABELS.researching,
    colour:    'var(--color-intelligence)',
    animation: 'pcos-orbit-cyan',
    ariaLabel: 'Intelligence is researching',
  },
} as const;

/* ── Size Configuration ─────────────────────────────────────────────────── */

const DOT_SIZE: Record<StatusSize, string> = {
  xs: 'h-1.5 w-1.5',
  sm: 'h-2   w-2',
  md: 'h-2.5 w-2.5',
  lg: 'h-3.5 w-3.5',
};

const LABEL_SIZE: Record<StatusSize, string> = {
  xs: 'text-[10px]',
  sm: 'text-xs',
  md: 'text-sm',
  lg: 'text-base',
};

const GAP_SIZE: Record<StatusSize, string> = {
  xs: 'gap-1',
  sm: 'gap-1.5',
  md: 'gap-2',
  lg: 'gap-2.5',
};

/* ── Dot Shape Components ───────────────────────────────────────────────── */

/**
 * Renders the animated dot for a given state.
 * The 'writing' state renders 3 bars instead of a single dot.
 */
function StatusDot({
  state,
  size,
  animate,
}: {
  state:   IntelligenceState;
  size:    StatusSize;
  animate: boolean;
}) {
  const config = STATE_CONFIG[state];

  if (state === 'writing') {
    // 3 staggered vertical bars for the composing state
    return (
      <span
        aria-hidden="true"
        className={`inline-flex items-end gap-0.5 ${size === 'lg' ? 'h-4' : size === 'md' ? 'h-3' : 'h-2.5'}`}
        data-ux-state={state}
      >
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className={`w-0.5 rounded-full`}
            style={{
              backgroundColor: config.colour,
              height: size === 'lg' ? `${10 + i * 3}px` : `${6 + i * 2}px`,
              animation: animate
                ? `pcos-wave-bar 1.2s ease-in-out ${i * 0.15}s infinite alternate`
                : 'none',
            }}
          />
        ))}
      </span>
    );
  }

  return (
    <span
      aria-hidden="true"
      data-ux-state={state}
      className={`inline-block rounded-full flex-shrink-0 ${DOT_SIZE[size]}`}
      style={{
        backgroundColor: config.colour,
        animation: animate && config.animation ? `${config.animation} 1.5s ease-in-out infinite` : 'none',
        boxShadow: animate && state !== 'idle' && state !== 'error'
          ? `0 0 8px ${config.colour}`
          : 'none',
      }}
    />
  );
}

/* ── Component ──────────────────────────────────────────────────────────── */

export function IntelligenceStatus({
  state         = 'idle',
  size          = 'md',
  showLabel     = true,
  showAnimation = true,
  label,
  subLabel,
  className     = '',
}: IntelligenceStatusProps) {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mq.matches);
    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  const config  = STATE_CONFIG[state];
  const animate = showAnimation && !prefersReducedMotion;
  const displayLabel = label ?? config.label;

  return (
    <span
      role="status"
      aria-live="polite"
      aria-label={config.ariaLabel}
      data-testid="intelligence-status"
      className={`
        inline-flex items-center ${GAP_SIZE[size]}
        ${className}
      `.trim()}
    >
      <StatusDot state={state} size={size} animate={animate} />

      {showLabel && (
        <span className={`flex flex-col leading-none ${LABEL_SIZE[size]}`}>
          <span
            className="font-medium"
            style={{ color: config.colour }}
            aria-hidden="true"
          >
            {displayLabel}
          </span>
          {subLabel && (
            <span
              className={`text-muted mt-0.5 ${size === 'lg' ? 'text-xs' : 'text-[10px]'}`}
              aria-hidden="true"
            >
              {subLabel}
            </span>
          )}
        </span>
      )}

      {/* Screen reader only: full label including subLabel */}
      <span className="sr-only">
        {displayLabel}{subLabel ? ` — ${subLabel}` : ''}
      </span>
    </span>
  );
}
