/**
 * Tooltip — Accessible contextual label
 * ========================================
 * Shows a tooltip on hover AND keyboard focus (not title attribute).
 * Uses aria-describedby pattern for screen reader compatibility.
 * Pure CSS positioning — no floating-ui or popper.js dependency.
 *
 * Four positions: top (default), bottom, left, right.
 * Works on both touch (tap to show) and desktop (hover/focus).
 *
 * Resolves QA issue M-03 from Phase G-02 (title-attribute tooltip unreliability).
 *
 * @lifecycle Approved
 * @since v0.5.0
 * @clientReason Manages hover/focus state via CSS; safe in RSC via CSS-only approach.
 *   Actually stateless — uses CSS :hover/:focus-within, no React state needed.
 * @owner Lead Frontend Architect
 */

import { useId } from 'react';

/* ── Types ─────────────────────────────────────────────────────────────── */

type TooltipPosition = 'top' | 'bottom' | 'left' | 'right';

interface TooltipProps {
  content:    string;
  position?:  TooltipPosition;
  children:   React.ReactElement;
  className?: string;
}

/* ── Position classes ───────────────────────────────────────────────────── */

const positionClasses: Record<TooltipPosition, string> = {
  top:    'bottom-full left-1/2 -translate-x-1/2 mb-2',
  bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
  left:   'right-full top-1/2 -translate-y-1/2 mr-2',
  right:  'left-full top-1/2 -translate-y-1/2 ml-2',
};

const arrowClasses: Record<TooltipPosition, string> = {
  top:    'top-full left-1/2 -translate-x-1/2 border-t-surface-2 border-x-transparent border-b-transparent',
  bottom: 'bottom-full left-1/2 -translate-x-1/2 border-b-surface-2 border-x-transparent border-t-transparent',
  left:   'left-full top-1/2 -translate-y-1/2 border-l-surface-2 border-y-transparent border-r-transparent',
  right:  'right-full top-1/2 -translate-y-1/2 border-r-surface-2 border-y-transparent border-l-transparent',
};

/* ── Component ──────────────────────────────────────────────────────────── */

function Tooltip({
  content,
  position  = 'top',
  children,
  className = '',
}: TooltipProps) {
  const uid       = useId();
  const tooltipId = `${uid}-tooltip`;

  return (
    <span
      className={`relative inline-flex group/tooltip ${className}`}
    >
      {/*
        Clone child to inject aria-describedby.
        The child must be a focusable element (button, a, input, etc.)
        for keyboard accessibility.
      */}
      {/* We use a wrapper span approach to avoid cloneElement complexity */}
      <span
        aria-describedby={tooltipId}
        className="contents"
      >
        {children}
      </span>

      {/*
        Tooltip bubble — hidden by default, visible on group hover or focus.
        CSS-only: no JS state, no portal.
        opacity-0 → opacity-100 and pointer-events-none → pointer-events-auto
        on parent .group/tooltip:hover and .group/tooltip:focus-within
      */}
      <span
        id={tooltipId}
        role="tooltip"
        className={[
          'absolute z-50 w-max max-w-[200px]',
          'rounded-md border border-border',
          'bg-surface-2 px-2.5 py-1.5',
          'text-xs text-fg leading-snug',
          'shadow-lg',
          'pointer-events-none',
          // Animation
          'opacity-0 scale-95',
          'transition-all duration-fast',
          'group-hover/tooltip:opacity-100 group-hover/tooltip:scale-100',
          'group-focus-within/tooltip:opacity-100 group-focus-within/tooltip:scale-100',
          positionClasses[position],
        ].join(' ')}
      >
        {content}
        {/* Arrow */}
        <span
          aria-hidden="true"
          className={[
            'absolute w-0 h-0 border-4',
            arrowClasses[position],
          ].join(' ')}
        />
      </span>
    </span>
  );
}

export { Tooltip };
export type { TooltipProps, TooltipPosition };
