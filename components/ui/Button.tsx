/**
 * Button — Interactive action trigger
 * =====================================
 * Four variants: primary, secondary, ghost, danger.
 * Three sizes: sm, md, lg.
 * Supports: loading state, left icon, full-width, disabled.
 * Renders as <button> or <a> (via asChild pattern via href prop).
 *
 * @lifecycle Approved
 * @since v0.5.0
 * @owner Lead Frontend Architect
 */
'use client';

import { forwardRef } from 'react';
import Link from 'next/link';

/* ── Types ─────────────────────────────────────────────────────────────── */

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
type ButtonSize    = 'sm' | 'md' | 'lg';

interface ButtonBaseProps {
  variant?:   ButtonVariant;
  size?:      ButtonSize;
  loading?:   boolean;
  icon?:      React.ReactNode;
  fullWidth?: boolean;
  children?:  React.ReactNode;
  className?: string;
}

type ButtonAsButton = ButtonBaseProps &
  Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, keyof ButtonBaseProps> & {
    href?: undefined;
  };

type ButtonAsLink = ButtonBaseProps &
  Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, keyof ButtonBaseProps> & {
    href: string;
  };

type ButtonProps = ButtonAsButton | ButtonAsLink;

/* ── Style Maps ─────────────────────────────────────────────────────────── */

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    'bg-brand text-white border-transparent ' +
    'hover:opacity-90 active:opacity-80 ' +
    'focus-visible:ring-brand',
  secondary:
    'bg-surface text-fg border-border ' +
    'hover:bg-surface-hover hover:border-border-glow ' +
    'focus-visible:ring-brand',
  ghost:
    'bg-transparent text-muted border-transparent ' +
    'hover:bg-surface-hover hover:text-fg ' +
    'focus-visible:ring-brand',
  danger:
    'bg-danger/10 text-danger border-danger/30 ' +
    'hover:bg-danger/20 hover:border-danger/50 ' +
    'focus-visible:ring-danger',
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'h-8  px-3   text-xs  gap-1.5',
  md: 'h-9  px-4   text-sm  gap-2',
  lg: 'h-11 px-5   text-base gap-2.5',
};

/* ── Spinner ────────────────────────────────────────────────────────────── */

function Spinner() {
  return (
    <svg
      className="animate-spin"
      width="14"
      height="14"
      viewBox="0 0 14 14"
      fill="none"
      aria-hidden="true"
    >
      <circle
        cx="7" cy="7" r="5.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeOpacity="0.3"
      />
      <path
        d="M7 1.5A5.5 5.5 0 0 1 12.5 7"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

/* ── Shared inner content ───────────────────────────────────────────────── */

function ButtonContent({
  loading,
  icon,
  children,
}: {
  loading?: boolean;
  icon?: React.ReactNode;
  children?: React.ReactNode;
}) {
  return (
    <>
      {loading ? <Spinner /> : icon ? <span aria-hidden="true">{icon}</span> : null}
      {children && <span>{children}</span>}
    </>
  );
}

/* ── Component ──────────────────────────────────────────────────────────── */

const Button = forwardRef<HTMLButtonElement | HTMLAnchorElement, ButtonProps>(
  function Button(props, ref) {
    const {
      variant   = 'secondary',
      size      = 'md',
      loading   = false,
      icon,
      fullWidth = false,
      children,
      className = '',
      ...rest
    } = props;

    const base = [
      'inline-flex items-center justify-center',
      'rounded-md border',
      'font-medium leading-none',
      'transition-colors duration-fast',
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-bg',
      'disabled:pointer-events-none disabled:opacity-40',
      'select-none',
      variantClasses[variant],
      sizeClasses[size],
      fullWidth ? 'w-full' : '',
      loading   ? 'cursor-wait' : '',
      className,
    ]
      .filter(Boolean)
      .join(' ');

    if ('href' in rest && rest.href !== undefined) {
      const { href, ...linkRest } = rest as ButtonAsLink;
      return (
        <Link
          href={href}
          ref={ref as React.Ref<HTMLAnchorElement>}
          className={base}
          aria-disabled={loading}
          {...(linkRest as object)}
        >
          <ButtonContent loading={loading} icon={icon}>{children}</ButtonContent>
        </Link>
      );
    }

    const { ...buttonRest } = rest as ButtonAsButton;
    return (
      <button
        ref={ref as React.Ref<HTMLButtonElement>}
        className={base}
        disabled={(buttonRest as React.ButtonHTMLAttributes<HTMLButtonElement>).disabled || loading}
        aria-busy={loading}
        {...(buttonRest as React.ButtonHTMLAttributes<HTMLButtonElement>)}
      >
        <ButtonContent loading={loading} icon={icon}>{children}</ButtonContent>
      </button>
    );
  }
);

Button.displayName = 'Button';
export { Button };
export type { ButtonProps, ButtonVariant, ButtonSize };
