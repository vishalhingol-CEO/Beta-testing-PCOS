/**
 * IntelligenceOrb — Animated Intelligence Focal Point
 * =====================================================
 * The central visual metaphor of PCOS intelligence on the dashboard.
 * Communicates that the system is alive, aware, and responsive.
 *
 * This is NOT a chatbot prompt. It is the cognitive focal point of the OS.
 * The orb's colour and animation respond to UXState.
 *
 * Visual: radial gradient core + orbital ring + ambient glow.
 * All colours from CSS custom properties — never hardcoded.
 *
 * @param state   - Current intelligence state
 * @param size    - Orb diameter in px (default: 120)
 * @param onClick - Optional click handler (navigates to /context in Phase I)
 *
 * @lifecycle Approved
 * @since v0.5.0 Phase H
 * @owner Lead Frontend Architect
 */
'use client';
// Reason: uses animation state and useEffect for reduced-motion

import { useEffect, useState } from 'react';
import type { UXState } from '@/lib/constants/ux-labels';
import { UX_STATE_LABELS, UX_STATE_IDLE_LABEL } from '@/lib/constants/ux-labels';

type OrbState = UXState | 'idle' | 'error' | 'processing';

interface IntelligenceOrbProps {
  state?:    OrbState;
  /** Memory count — shown as a subtle badge when > 0. */
  memoryCount?: number;
  /** Processing count — shown as amber badge when > 0. */
  processingCount?: number;
  size?:     number;
  onClick?:  () => void;
  className?: string;
}

const ORB_COLOURS: Record<OrbState, { core: string; glow: string; ring: string }> = {
  idle:        { core: 'var(--color-brand)',        glow: 'var(--color-brand)',        ring: 'var(--color-brand)' },
  thinking:    { core: 'var(--color-brand)',        glow: 'var(--color-brand)',        ring: 'var(--color-intelligence)' },
  recalling:   { core: 'var(--color-memory)',       glow: 'var(--color-memory)',       ring: 'var(--color-memory)' },
  coding:      { core: 'var(--color-code)',         glow: 'var(--color-code)',         ring: 'var(--color-code)' },
  planning:    { core: 'var(--color-agent)',        glow: 'var(--color-agent)',        ring: 'var(--color-agent)' },
  writing:     { core: 'var(--color-compose)',      glow: 'var(--color-compose)',      ring: 'var(--color-compose)' },
  researching: { core: 'var(--color-intelligence)', glow: 'var(--color-intelligence)', ring: 'var(--color-intelligence)' },
  processing:  { core: 'var(--color-agent)',        glow: 'var(--color-agent)',        ring: 'var(--color-agent)' },
  error:       { core: 'var(--color-danger)',       glow: 'var(--color-danger)',       ring: 'var(--color-danger)' },
};

const ORB_ANIMATIONS: Record<OrbState, string> = {
  idle:        'pcos-orb-breathe',
  thinking:    'pcos-orb-pulse',
  recalling:   'pcos-orb-flash',
  coding:      'pcos-orb-blink',
  planning:    'pcos-orb-ripple',
  writing:     'pcos-orb-wave',
  researching: 'pcos-orb-orbit',
  processing:  'pcos-orb-ripple',
  error:       '',
};

function getStateLabel(state: OrbState): string {
  if (state === 'idle') return UX_STATE_IDLE_LABEL;
  if (state === 'error') return 'System error';
  if (state === 'processing') return 'Indexing memories...';
  return UX_STATE_LABELS[state as UXState];
}

export function IntelligenceOrb({
  state           = 'idle',
  memoryCount     = 0,
  processingCount = 0,
  size            = 120,
  onClick,
  className       = '',
}: IntelligenceOrbProps) {
  const [reducedMotion, setReducedMotion] = useState(false);
  const [dimmed, setDimmed] = useState(false);

  // Respect prefers-reduced-motion
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mq.matches);
    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  // Dim after 30s of idle state
  useEffect(() => {
    if (state !== 'idle') { setDimmed(false); return; }
    const timer = setTimeout(() => setDimmed(true), 30_000);
    return () => clearTimeout(timer);
  }, [state]);

  const colours   = ORB_COLOURS[state];
  const animation = reducedMotion ? '' : ORB_ANIMATIONS[state];
  const label     = getStateLabel(state);

  const Tag = onClick ? 'button' : 'div';

  return (
    <Tag
      {...(onClick ? {
        onClick,
        'aria-label':    `Intelligence system: ${label}. Click to open intelligence interface.`,
        'data-testid':   'intelligence-orb',
        type:            'button' as const,
      } : {
        role:            'img',
        'aria-label':    `Intelligence system: ${label}`,
        'data-testid':   'intelligence-orb',
      })}
      className={`
        relative inline-flex items-center justify-center
        ${onClick ? 'cursor-pointer' : 'cursor-default'}
        transition-opacity duration-slow
        ${dimmed ? 'opacity-60' : 'opacity-100'}
        ${className}
      `.trim()}
      style={{ width: size, height: size }}
    >
      {/* Outer glow ring */}
      <span
        aria-hidden="true"
        className="absolute inset-0 rounded-full"
        style={{
          animation: animation ? `${animation}-ring 3s ease-in-out infinite` : 'none',
          background: `radial-gradient(circle, color-mix(in srgb, ${colours.glow} 15%, transparent) 0%, transparent 70%)`,
        }}
      />

      {/* Orbital ring */}
      <span
        aria-hidden="true"
        className="absolute rounded-full border"
        style={{
          inset:        size * 0.08,
          borderColor:  `color-mix(in srgb, ${colours.ring} 40%, transparent)`,
          animation:    reducedMotion ? 'none' : 'pcos-orbital 8s linear infinite',
          borderStyle:  'solid',
          borderWidth:  '1px',
        }}
      />

      {/* Inner secondary ring */}
      <span
        aria-hidden="true"
        className="absolute rounded-full border"
        style={{
          inset:        size * 0.18,
          borderColor:  `color-mix(in srgb, ${colours.ring} 25%, transparent)`,
          animation:    reducedMotion ? 'none' : 'pcos-orbital 5s linear infinite reverse',
          borderStyle:  'dashed',
          borderWidth:  '1px',
        }}
      />

      {/* Core sphere */}
      <span
        aria-hidden="true"
        className="relative rounded-full flex items-center justify-center"
        style={{
          width:      size * 0.45,
          height:     size * 0.45,
          background: `radial-gradient(circle at 35% 35%, color-mix(in srgb, ${colours.core} 90%, white), ${colours.core})`,
          boxShadow:  `0 0 ${size * 0.2}px color-mix(in srgb, ${colours.glow} 50%, transparent)`,
          animation:  animation && !reducedMotion ? `${animation} 2s ease-in-out infinite` : 'none',
        }}
      />

      {/* Processing count badge */}
      {processingCount > 0 && (
        <span
          aria-label={`${processingCount} memories processing`}
          className="absolute top-0 right-0 flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-[10px] font-bold text-white"
          style={{ background: 'var(--color-agent)' }}
        >
          {processingCount}
        </span>
      )}

      {/* Sub-label */}
      {dimmed && state === 'idle' && (
        <span
          className="absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap text-xs text-muted"
          aria-hidden="true"
        >
          System ready
        </span>
      )}
    </Tag>
  );
}
