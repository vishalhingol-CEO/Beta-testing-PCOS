/**
 * StatusPulse — UXState animated indicator
 * ==========================================
 * Maps all 6 PCOS UXState values to their defined animations and colours.
 * When state is null: renders a static neutral dot.
 *
 * Constitution Law 3: never exposes provider names.
 * The `label` shown to users is a cognitive-mode label, not a provider label.
 *
 * Animation keyframes are defined in styles/animations.css.
 * Colours resolve from CSS custom properties in styles/design-system.css.
 *
 * @lifecycle Approved
 * @since v0.5.0
 * @clientReason Uses CSS animation classes; safe as a Server Component
 *   but kept as shared — no hooks used, can be used in both contexts.
 * @owner Lead Frontend Architect
 */

/* ── Types ─────────────────────────────────────────────────────────────── */

type UXState =
  | 'thinking'
  | 'recalling'
  | 'coding'
  | 'planning'
  | 'writing'
  | 'researching';

type PulseSize = 'sm' | 'md' | 'lg';

interface StatusPulseProps {
  state:      UXState | null;
  size?:      PulseSize;
  /** Show the human-readable state label next to the pulse */
  showLabel?: boolean;
  className?: string;
}

/* ── Config ─────────────────────────────────────────────────────────────── */

interface StateConfig {
  /** Tailwind colour class for text/bg */
  colour:     string;
  /** CSS animation name from animations.css */
  animation:  string;
  /** Human-readable label — NEVER a provider name */
  label:      string;
  /** aria-label for the animated element */
  ariaLabel:  string;
}

const STATE_CONFIG: Record<UXState, StateConfig> = {
  thinking: {
    colour:    'text-ux-thinking',
    animation: '[animation:pcos-orbital_6s_linear_infinite]',
    label:     'Reasoning',
    ariaLabel: 'Reasoning in progress',
  },
  recalling: {
    colour:    'text-ux-recalling',
    animation: '[animation:pcos-recall-shimmer_1.2s_ease-in-out_infinite_alternate]',
    label:     'Recalled',
    ariaLabel: 'Recalling from memory',
  },
  coding: {
    colour:    'text-ux-coding',
    animation: '[animation:pcos-cursor-blink_530ms_steps(1)_infinite]',
    label:     'Coding',
    ariaLabel: 'Coding in progress',
  },
  planning: {
    colour:    'text-ux-planning',
    animation: '[animation:pcos-node-connect_1.5s_ease-in-out_infinite]',
    label:     'Planning',
    ariaLabel: 'Planning in progress',
  },
  writing: {
    colour:    'text-ux-writing',
    animation: '[animation:pcos-flow-line_1.8s_ease-in-out_infinite]',
    label:     'Writing',
    ariaLabel: 'Writing in progress',
  },
  researching: {
    colour:    'text-ux-researching',
    animation: '[animation:pcos-sweep_800ms_ease-in-out_infinite]',
    label:     'Researching',
    ariaLabel: 'Searching for information',
  },
};

const sizePulse: Record<PulseSize, string> = {
  sm: 'h-2 w-2',
  md: 'h-3 w-3',
  lg: 'h-4 w-4',
};

const sizeText: Record<PulseSize, string> = {
  sm: 'text-xs',
  md: 'text-sm',
  lg: 'text-base',
};

/* ── Sub-components ─────────────────────────────────────────────────────── */

/**
 * The visual pulse element for each UXState.
 * Each state has a distinct shape/animation to be identifiable without colour alone.
 */
function PulseShape({ state, size }: { state: UXState; size: PulseSize }) {
  const config = STATE_CONFIG[state];

  if (state === 'thinking') {
    // Orbital ring — rotating circle outline
    return (
      <span
        aria-hidden="true"
        data-ux-state={state}
        className={`
          inline-block rounded-full border-2 border-current opacity-90
          ${sizePulse[size]} ${config.colour} ${config.animation}
        `}
      />
    );
  }

  if (state === 'recalling') {
    // Filled circle with shimmer pulse
    return (
      <span
        aria-hidden="true"
        data-ux-state={state}
        className={`
          inline-block rounded-full bg-current
          ${sizePulse[size]} ${config.colour} ${config.animation}
        `}
      />
    );
  }

  if (state === 'coding') {
    // Blinking vertical bar (cursor)
    return (
      <span
        aria-hidden="true"
        data-ux-state={state}
        className={`
          inline-block rounded-sm bg-current
          ${size === 'sm' ? 'h-3 w-0.5' : size === 'md' ? 'h-4 w-0.5' : 'h-5 w-1'}
          ${config.colour} ${config.animation}
        `}
      />
    );
  }

  if (state === 'planning') {
    // Small diamond-ish dot with pulsing scale
    return (
      <span
        aria-hidden="true"
        data-ux-state={state}
        className={`
          inline-block rounded-sm bg-current rotate-45
          ${size === 'sm' ? 'h-1.5 w-1.5' : size === 'md' ? 'h-2 w-2' : 'h-2.5 w-2.5'}
          ${config.colour} ${config.animation}
        `}
      />
    );
  }

  if (state === 'writing') {
    // Horizontal line that scales
    return (
      <span
        aria-hidden="true"
        data-ux-state={state}
        className={`
          inline-block rounded-full bg-current origin-left
          ${size === 'sm' ? 'h-0.5 w-4' : size === 'md' ? 'h-0.5 w-5' : 'h-1 w-6'}
          ${config.colour} ${config.animation}
        `}
      />
    );
  }

  // researching — sweeping dot
  return (
    <span
      aria-hidden="true"
      data-ux-state={state}
      className={`
        relative inline-block overflow-hidden rounded-full bg-current/20
        ${sizePulse[size]} ${config.colour}
      `}
    >
      <span
        className={`
          absolute inset-y-0 w-1/2 bg-current rounded-full
          ${config.animation}
        `}
      />
    </span>
  );
}

/* ── Component ──────────────────────────────────────────────────────────── */

function StatusPulse({
  state,
  size      = 'md',
  showLabel = false,
  className = '',
}: StatusPulseProps) {
  // Null state — neutral static dot
  if (state === null) {
    return (
      <span
        className={`inline-flex items-center gap-2 ${className}`}
        aria-label="Idle"
      >
        <span
          aria-hidden="true"
          className={`inline-block rounded-full bg-subtle ${sizePulse[size]}`}
        />
        {showLabel && (
          <span className={`text-subtle font-medium ${sizeText[size]}`}>Idle</span>
        )}
      </span>
    );
  }

  const config = STATE_CONFIG[state];

  return (
    <span
      className={`inline-flex items-center gap-2 ${className}`}
      role="status"
      aria-label={config.ariaLabel}
      aria-live="polite"
    >
      <PulseShape state={state} size={size} />
      {showLabel && (
        <span className={`${config.colour} font-medium ${sizeText[size]}`}>
          {config.label}
        </span>
      )}
    </span>
  );
}

export { StatusPulse };
export type { StatusPulseProps, UXState, PulseSize };
