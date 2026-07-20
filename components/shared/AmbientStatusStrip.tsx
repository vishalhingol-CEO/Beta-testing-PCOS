/**
 * AmbientStatusStrip — System State Ambient Indicator
 * =====================================================
 * A 2px strip at the very top of the Shell, below browser chrome.
 * Communicates system state without requiring user attention.
 * Inspired by NASA Mission Control terminal status strips.
 *
 * Idle/Ready:          var(--color-border) — barely visible
 * Thinking/Processing: var(--color-intelligence) — cyan, pulsing
 * Recalling:           var(--color-memory) — violet, brief flash
 * Error:               var(--color-danger) — red, steady
 *
 * prefers-reduced-motion: colour changes, no pulse animation.
 *
 * @param state - Current intelligence UXState or system state
 *
 * @lifecycle Approved
 * @since v0.5.0 Phase H
 */

'use client';
// Reason: polls provider health, manages animation, reads reduced-motion

import { useEffect, useState } from 'react';
import type { UXState } from '@/lib/constants/ux-labels';

type StripState = UXState | 'idle' | 'error' | 'processing';

interface AmbientStatusStripProps {
  state?: StripState;
}

const STRIP_COLOUR: Record<StripState, string> = {
  idle:        'var(--color-border)',
  thinking:    'var(--color-intelligence)',
  recalling:   'var(--color-memory)',
  coding:      'var(--color-code)',
  planning:    'var(--color-agent)',
  writing:     'var(--color-compose)',
  researching: 'var(--color-intelligence)',
  processing:  'var(--color-agent)',
  error:       'var(--color-danger)',
};

const STRIP_ANIMATE: Record<StripState, boolean> = {
  idle:        false,
  thinking:    true,
  recalling:   true,
  coding:      true,
  planning:    true,
  writing:     true,
  researching: true,
  processing:  true,
  error:       false,
};

export function AmbientStatusStrip({ state = 'idle' }: AmbientStatusStripProps) {
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mq.matches);
    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  const colour  = STRIP_COLOUR[state];
  const animate = STRIP_ANIMATE[state] && !reducedMotion;

  return (
    <div
      role="status"
      aria-label={`System status: ${state}`}
      aria-live="polite"
      data-testid="ambient-status-strip"
      className="h-0.5 w-full flex-shrink-0 transition-colors duration-normal"
      style={{
        backgroundColor: colour,
        animation: animate ? 'pcos-strip-pulse 2s ease-in-out infinite' : 'none',
      }}
    />
  );
}
