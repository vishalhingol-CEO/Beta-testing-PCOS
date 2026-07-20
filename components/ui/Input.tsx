/**
 * Input — Text input and Textarea
 * ==================================
 * Single component covers both <input> and <textarea> via `as` prop.
 * Supports: label, helper text, error state, disabled, required.
 * Focus glow uses brand colour (violet).
 * Error state uses danger colour (rose).
 *
 * @lifecycle Approved
 * @since v0.5.0
 * @owner Lead Frontend Architect
 */

import { forwardRef, useId } from 'react';

/* ── Types ─────────────────────────────────────────────────────────────── */

interface InputBaseProps {
  /** 'input' (default) or 'textarea' */
  as?:         'input' | 'textarea';
  label?:      string;
  helperText?: string;
  error?:      string;
  /** Number of visible rows for textarea (default 4) */
  rows?:       number;
  className?:  string;
}

type InputAsInput = InputBaseProps &
  Omit<React.InputHTMLAttributes<HTMLInputElement>, keyof InputBaseProps> & {
    as?: 'input';
  };

type InputAsTextarea = InputBaseProps &
  Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, keyof InputBaseProps> & {
    as: 'textarea';
  };

type InputProps = InputAsInput | InputAsTextarea;

/* ── Shared field classes ───────────────────────────────────────────────── */

function fieldClasses(hasError: boolean, className = '') {
  return [
    'w-full rounded-md border bg-surface px-3 py-2',
    'text-base text-fg placeholder:text-subtle',
    'transition-colors duration-fast',
    'focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-offset-bg',
    hasError
      ? 'border-danger/50 focus:ring-danger focus:border-danger/50'
      : 'border-border focus:ring-brand focus:border-brand/60',
    'disabled:opacity-40 disabled:cursor-not-allowed',
    className,
  ]
    .filter(Boolean)
    .join(' ');
}

/* ── Component ──────────────────────────────────────────────────────────── */

const Input = forwardRef<
  HTMLInputElement | HTMLTextAreaElement,
  InputProps
>(function Input(props, ref) {
  const {
    as          = 'input',
    label,
    helperText,
    error,
    rows        = 4,
    className   = '',
    ...rest
  } = props;

  const uid      = useId();
  const inputId  = `${uid}-input`;
  const errorId  = `${uid}-error`;
  const helperId = `${uid}-helper`;
  const hasError = Boolean(error);

  const describedBy = [
    hasError  ? errorId  : null,
    helperText && !hasError ? helperId : null,
  ]
    .filter(Boolean)
    .join(' ') || undefined;

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label
          htmlFor={inputId}
          className="text-sm font-medium text-fg leading-none"
        >
          {label}
          {(rest as React.InputHTMLAttributes<HTMLInputElement>).required && (
            <span className="ml-1 text-danger" aria-hidden="true">*</span>
          )}
        </label>
      )}

      {as === 'textarea' ? (
        <textarea
          id={inputId}
          ref={ref as React.Ref<HTMLTextAreaElement>}
          rows={rows}
          aria-describedby={describedBy}
          aria-invalid={hasError || undefined}
          className={`${fieldClasses(hasError, className)} resize-y min-h-[80px]`}
          {...(rest as React.TextareaHTMLAttributes<HTMLTextAreaElement>)}
        />
      ) : (
        <input
          id={inputId}
          ref={ref as React.Ref<HTMLInputElement>}
          aria-describedby={describedBy}
          aria-invalid={hasError || undefined}
          className={fieldClasses(hasError, className)}
          {...(rest as React.InputHTMLAttributes<HTMLInputElement>)}
        />
      )}

      {hasError && (
        <p id={errorId} role="alert" className="text-xs text-danger leading-snug">
          {error}
        </p>
      )}

      {helperText && !hasError && (
        <p id={helperId} className="text-xs text-muted leading-snug">
          {helperText}
        </p>
      )}
    </div>
  );
});

Input.displayName = 'Input';
export { Input };
export type { InputProps };
