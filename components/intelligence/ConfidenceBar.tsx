/**
 * ConfidenceBar — Visual confidence or similarity score bar
 * ===========================================================
 * Renders a horizontal progress bar representing a score (0.0–1.0).
 * Used in: SearchResult (similarity), Memory Detail (confidence),
 *          AIUsagePanel (efficiency ring variant).
 *
 * Raw decimal values are NEVER shown to users.
 * Labels come from lib/constants/ux-labels.ts.
 *
 * @param score      - Float 0.0–1.0
 * @param label      - Human-readable label override (defaults to getSimilarityLabel)
 * @param showLabel  - Show label text (default: true)
 * @param showScore  - Show percentage (default: false — raw decimal never shown)
 * @param size       - Bar height variant
 * @param colour     - Colour CSS var override (defaults to semantic colour for score)
 *
 * @lifecycle Approved
 * @since v0.5.0 Phase H
 * @owner Lead Frontend Architect
 */

import {
  getSimilarityLabel,
  getSimilarityColour,
} from '@/lib/constants/ux-labels';

interface ConfidenceBarProps {
  score:      number;
  label?:     string;
  showLabel?: boolean;
  showScore?: boolean;
  size?:      'xs' | 'sm' | 'md';
  colour?:    string;
  className?: string;
}

const BAR_HEIGHT: Record<NonNullable<ConfidenceBarProps['size']>, string> = {
  xs: 'h-1',
  sm: 'h-1.5',
  md: 'h-2',
};

export function ConfidenceBar({
  score,
  label,
  showLabel = true,
  showScore = false,
  size      = 'sm',
  colour,
  className = '',
}: ConfidenceBarProps) {
  const clampedScore  = Math.max(0, Math.min(1, score));
  const pct           = Math.round(clampedScore * 100);
  const displayLabel  = label ?? getSimilarityLabel(clampedScore);
  const displayColour = colour ?? getSimilarityColour(clampedScore);

  return (
    <div
      className={`flex flex-col gap-1 ${className}`}
      role="meter"
      aria-label={`${displayLabel}: ${pct}%`}
      aria-valuenow={pct}
      aria-valuemin={0}
      aria-valuemax={100}
      data-testid="confidence-bar"
    >
      {showLabel && (
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium" style={{ color: displayColour }}>
            {displayLabel}
          </span>
          {showScore && (
            <span className="font-mono text-xs text-muted">
              {pct}%
            </span>
          )}
        </div>
      )}

      <div
        className={`w-full overflow-hidden rounded-full bg-surface-hover ${BAR_HEIGHT[size]}`}
        aria-hidden="true"
      >
        <div
          className={`${BAR_HEIGHT[size]} rounded-full transition-all duration-slow`}
          style={{
            width:      `${pct}%`,
            background: displayColour,
          }}
        />
      </div>
    </div>
  );
}
