/**
 * Toast — Notification system
 * =============================
 * Four types: success, error, warning, info.
 * Auto-dismisses after `duration` ms (default 4000).
 * Stacks up to 5 toasts; oldest auto-dismissed when limit exceeded.
 * Position: bottom-right desktop / bottom-center mobile.
 *
 * Usage:
 *   1. Wrap app in <ToastProvider> (done in app/layout.tsx).
 *   2. In any Client Component: const { toast } = useToast()
 *      toast('Memory saved', 'success')
 *      toast('Connection lost', 'error', { duration: 6000 })
 *
 * @lifecycle Approved
 * @since v0.5.0
 * @clientReason Manages toast queue state; requires browser context.
 * @owner Lead Frontend Architect
 */
'use client';

import {
  createContext,
  useCallback,
  useContext,
  useId,
  useReducer,
  useEffect,
  useRef,
} from 'react';

/* ── Types ─────────────────────────────────────────────────────────────── */

type ToastType = 'success' | 'error' | 'warning' | 'info';

interface ToastItem {
  id:       string;
  message:  string;
  type:     ToastType;
  duration: number;
}

interface ToastOptions {
  duration?: number;
}

interface ToastContextValue {
  toast: (message: string, type?: ToastType, options?: ToastOptions) => void;
}

/* ── State ──────────────────────────────────────────────────────────────── */

type ToastAction =
  | { type: 'ADD';    payload: ToastItem }
  | { type: 'REMOVE'; id: string };

const MAX_TOASTS = 5;

function toastReducer(state: ToastItem[], action: ToastAction): ToastItem[] {
  switch (action.type) {
    case 'ADD': {
      const next = [...state, action.payload];
      return next.length > MAX_TOASTS ? next.slice(next.length - MAX_TOASTS) : next;
    }
    case 'REMOVE':
      return state.filter((t) => t.id !== action.id);
    default:
      return state;
  }
}

/* ── Icons ──────────────────────────────────────────────────────────────── */

const ICON: Record<ToastType, React.ReactElement> = {
  success: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M5 8l2 2 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  error: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M5.5 5.5l5 5M10.5 5.5l-5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  ),
  warning: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M8 2L14.5 13.5H1.5L8 2z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
      <path d="M8 6v3.5M8 11v.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  ),
  info: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M8 7v4M8 5v.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  ),
};

const TYPE_CLASSES: Record<ToastType, string> = {
  success: 'text-success border-success/20 bg-success/10',
  error:   'text-danger  border-danger/20  bg-danger/10',
  warning: 'text-warning border-warning/20 bg-warning/10',
  info:    'text-info    border-info/20    bg-info/10',
};

/* ── Single Toast ────────────────────────────────────────────────────────── */

function ToastItem({
  item,
  onDismiss,
}: {
  item: ToastItem;
  onDismiss: (id: string) => void;
}) {
  // M-04 fix: `| null` produces MutableRefObject<T | null> (writable .current).
  // Without it, useRef<T>(null) returns RefObject<T> (read-only .current),
  // which causes a TypeScript error in strict mode on `timerRef.current = setTimeout(...)`.
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    timerRef.current = setTimeout(() => onDismiss(item.id), item.duration);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [item.id, item.duration, onDismiss]);

  return (
    <div
      role="alert"
      aria-live="assertive"
      aria-atomic="true"
      className={[
        'flex items-start gap-3 min-w-[260px] max-w-[380px]',
        'rounded-lg border px-4 py-3',
        'shadow-lg backdrop-blur-glass',
        'bg-surface',
        'animate-fade-slide-in',
        TYPE_CLASSES[item.type],
      ].join(' ')}
    >
      <span className="mt-0.5 flex-shrink-0">{ICON[item.type]}</span>
      <p className="flex-1 text-sm font-medium text-fg leading-snug">{item.message}</p>
      <button
        onClick={() => onDismiss(item.id)}
        aria-label="Dismiss notification"
        className="flex-shrink-0 text-muted hover:text-fg transition-colors duration-fast focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand rounded"
      >
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
          <path d="M2 2l10 10M12 2L2 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
      </button>
    </div>
  );
}

/* ── Context & Provider ──────────────────────────────────────────────────── */

const ToastContext = createContext<ToastContextValue | null>(null);

function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, dispatch] = useReducer(toastReducer, []);
  const uid        = useId();
  // M-01 fix: useRef persists the counter across re-renders without resetting.
  // A plain `let counter` inside the function body resets to 0 on every render,
  // allowing same-millisecond toasts to share an ID and produce duplicate keys.
  const counterRef = useRef(0);

  const toast = useCallback(
    (message: string, type: ToastType = 'info', options: ToastOptions = {}) => {
      const id = `${uid}-${Date.now()}-${counterRef.current++}`;
      dispatch({
        type: 'ADD',
        payload: {
          id,
          message,
          type,
          duration: options.duration ?? 4000,
        },
      });
    },
    [uid]
  );

  const dismiss = useCallback((id: string) => {
    dispatch({ type: 'REMOVE', id });
  }, []);

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}

      {/* Toast portal — fixed bottom-right (desktop) / bottom-center (mobile) */}
      <div
        aria-label="Notifications"
        className="
          fixed z-[9998] flex flex-col gap-2 p-4
          bottom-0 right-0
          sm:bottom-4 sm:right-4
          items-end sm:items-end
          pointer-events-none
        "
      >
        {toasts.map((item) => (
          <div key={item.id} className="pointer-events-auto">
            <ToastItem item={item} onDismiss={dismiss} />
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

/* ── Hook ───────────────────────────────────────────────────────────────── */

function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error('useToast must be used within a <ToastProvider>');
  }
  return ctx;
}

export { ToastProvider, useToast };
export type { ToastType, ToastOptions };
