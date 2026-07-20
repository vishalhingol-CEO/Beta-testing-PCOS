/**
 * PCOS Tailwind CSS Configuration
 * =================================
 * Extends the base Tailwind config with all PCOS design system tokens.
 * Every CSS custom property from styles/design-system.css is mapped to
 * a Tailwind utility here.
 *
 * CRITICAL: All new tokens are added under theme.extend, never under theme.
 * Replacing theme directly would remove Tailwind's default utilities.
 *
 * Single source of truth for values: styles/design-system.css
 * This file only maps those values to Tailwind utility names.
 * Never put a raw hex value in this file.
 *
 * Authority: PCOS_DESIGN_SYSTEM_FOUNDATION.md (Section 10)
 * Version:   v0.5.0
 */

import type { Config } from 'tailwindcss';

const config: Config = {
  /*
   * darkMode: 'class'
   * Enables dark mode via .dark class on <html>.
   * Set in app/layout.tsx. User-controlled toggle is a v0.6.0 feature.
   */
  darkMode: 'class',

  /*
   * content: Tell Tailwind where to look for class usage.
   * Scans all .tsx, .ts, .jsx, .js files in app/ and components/.
   * Does NOT scan lib/ (no Tailwind classes in business logic).
   */
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './lib/navigation/**/*.{ts,tsx}', // nav-config.ts uses type strings only, included for safety
  ],

  theme: {
    extend: {
      /* ------------------------------------------------------------------ */
      /* COLOURS                                                              */
      /* All map to CSS custom properties from design-system.css.            */
      /* ------------------------------------------------------------------ */
      colors: {
        // Background layer
        bg:             'var(--color-bg)',
        surface:        'var(--color-surface)',
        'surface-2':    'var(--color-surface-2)',
        'surface-hover':'var(--color-surface-hover)',

        // Border layer
        border:         'var(--color-border)',
        'border-glow':  'var(--color-border-glow)',

        // Text layer
        fg:             'var(--color-fg)',
        muted:          'var(--color-muted)',
        subtle:         'var(--color-subtle)',

        // Brand
        brand:          'var(--color-brand)',

        // UXState colours — use only in UXState-specific contexts
        'ux-thinking':    'var(--color-ux-thinking)',
        'ux-recalling':   'var(--color-ux-recalling)',
        'ux-coding':      'var(--color-ux-coding)',
        'ux-planning':    'var(--color-ux-planning)',
        'ux-writing':     'var(--color-ux-writing)',
        'ux-researching': 'var(--color-ux-researching)',

        // Semantic status
        success:  'var(--color-success)',
        warning:  'var(--color-warning)',
        danger:   'var(--color-danger)',
        info:     'var(--color-info)',
      },

      /* ------------------------------------------------------------------ */
      /* TYPOGRAPHY                                                           */
      /* ------------------------------------------------------------------ */
      fontFamily: {
        sans: ['var(--font-sans)', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['var(--font-mono)', 'ui-monospace', 'monospace'],
      },

      fontSize: {
        'xs':   ['var(--text-xs)',   { lineHeight: 'var(--leading-tight)' }],
        'sm':   ['var(--text-sm)',   { lineHeight: 'var(--leading-snug)' }],
        'base': ['var(--text-base)', { lineHeight: 'var(--leading-normal)' }],
        'lg':   ['var(--text-lg)',   { lineHeight: 'var(--leading-snug)' }],
        'xl':   ['var(--text-xl)',   { lineHeight: 'var(--leading-tight)' }],
        '2xl':  ['var(--text-2xl)',  { lineHeight: 'var(--leading-tight)' }],
        '3xl':  ['var(--text-3xl)',  { lineHeight: 'var(--leading-tight)' }],
      },

      letterSpacing: {
        tight:   'var(--tracking-tight)',
        normal:  'var(--tracking-normal)',
        wide:    'var(--tracking-wide)',
        widest:  'var(--tracking-widest)',
      },

      /* ------------------------------------------------------------------ */
      /* SPACING                                                              */
      /* ------------------------------------------------------------------ */
      spacing: {
        '0.5':  'var(--space-0-5)',
        '1':    'var(--space-1)',
        '2':    'var(--space-2)',
        '3':    'var(--space-3)',
        '4':    'var(--space-4)',
        '5':    'var(--space-5)',
        '6':    'var(--space-6)',
        '8':    'var(--space-8)',
        '10':   'var(--space-10)',
        '12':   'var(--space-12)',
        '16':   'var(--space-16)',
        '20':   'var(--space-20)',
        '24':   'var(--space-24)',
      },

      /* ------------------------------------------------------------------ */
      /* BORDER RADIUS                                                        */
      /* ------------------------------------------------------------------ */
      borderRadius: {
        'none': 'var(--radius-none)',
        'sm':   'var(--radius-sm)',
        'md':   'var(--radius-md)',
        'lg':   'var(--radius-lg)',
        'xl':   'var(--radius-xl)',
        'full': 'var(--radius-full)',
      },

      /* ------------------------------------------------------------------ */
      /* SHADOWS                                                              */
      /* ------------------------------------------------------------------ */
      boxShadow: {
        'sm':         'var(--shadow-sm)',
        'md':         'var(--shadow-md)',
        'lg':         'var(--shadow-lg)',
        'glow-brand': 'var(--shadow-glow-brand)',
        'glow-cyan':  'var(--shadow-glow-cyan)',
      },

      /* ------------------------------------------------------------------ */
      /* BACKDROP BLUR                                                        */
      /* ------------------------------------------------------------------ */
      backdropBlur: {
        'glass': 'var(--blur-glass)',
        'sm':    'var(--blur-sm)',
        'md':    'var(--blur-md)',
      },

      /* ------------------------------------------------------------------ */
      /* MOTION                                                               */
      /* ------------------------------------------------------------------ */
      transitionDuration: {
        'instant':    'var(--duration-instant)',
        'fast':       'var(--duration-fast)',
        'normal':     'var(--duration-normal)',
        'slow':       'var(--duration-slow)',
        'deliberate': 'var(--duration-deliberate)',
      },

      transitionTimingFunction: {
        'ease-out':    'var(--ease-out)',
        'ease-spring': 'var(--ease-spring)',
      },

      /* ------------------------------------------------------------------ */
      /* ANIMATIONS                                                           */
      /* Keyframes are defined in styles/animations.css.                     */
      /* These entries make them available as animate-* utilities.           */
      /* ------------------------------------------------------------------ */
      /*
       * keyframes block intentionally omitted.
       * All @keyframes are defined in styles/animations.css (imported via globals.css).
       * Defining them here too would create duplicate @keyframes declarations in the
       * compiled output. The animation shortcuts below reference the keyframe names
       * from animations.css — this is correct and sufficient.
       * See QA Report MAJ-01 resolution.
       */
      animation: {
        'fade-slide-in': 'pcos-fade-slide-in var(--duration-slow) var(--ease-out) both',
        'fade-in':       'pcos-fade-in var(--duration-slow) var(--ease-out) both',
        'shimmer':       'pcos-shimmer 1.5s var(--ease-in-out) infinite',
      },

      /* ------------------------------------------------------------------ */
      /* LAYOUT                                                               */
      /* ------------------------------------------------------------------ */
      maxWidth: {
        'content': '840px', // max page content width
      },

      width: {
        'sidebar': '240px',
      },

      height: {
        'topbar': '56px',
        'bottom-nav': '56px',
      },
    },
  },

  plugins: [],
};

export default config;
