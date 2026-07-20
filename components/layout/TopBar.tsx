/**
 * TopBar — Page Header (QA-H-003 Fixed)
 * =======================================
 * CANONICAL TOPBAR OWNERSHIP:
 * - Rendered by EACH PAGE exactly once — never by Shell
 * - Reads onOpenCommand from ShellContext when not passed as prop
 * - Provides: breadcrumb, page title, ⌘K trigger, action slot
 *
 * @lifecycle Approved — QA-H-003 remediation
 * @since v0.5.0 Phase H
 */

'use client';
// Reason: reads ShellContext (client-only)

import Link from 'next/link';
import { ChevronRight, Command } from 'lucide-react';
import { useShellContext } from '@/lib/shell-context';

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface TopBarProps {
  title?:         string;
  breadcrumb?:    BreadcrumbItem[];
  actions?:       React.ReactNode;
  /** Optional override — if omitted, reads from ShellContext automatically */
  onOpenCommand?: () => void;
}

export function TopBar({
  title,
  breadcrumb,
  actions,
  onOpenCommand: onOpenCommandProp,
}: TopBarProps) {
  const { openCommand: contextOpenCommand } = useShellContext();
  const onOpenCommand = onOpenCommandProp ?? contextOpenCommand;

  const displayItems: BreadcrumbItem[] = breadcrumb ?? (title ? [{ label: title }] : []);

  return (
    <header
      data-testid="topbar"
      className="
        flex h-[60px] flex-shrink-0 items-center justify-between
        border-b px-4 sm:px-6
      "
      style={{
        borderColor:     'var(--color-border)',
        backgroundColor: 'var(--color-surface)',
      }}
    >
      {/* Breadcrumb / Title */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 overflow-hidden">
        {displayItems.map((item, i) => {
          const isLast = i === displayItems.length - 1;
          return (
            <span key={i} className="flex items-center gap-1.5 min-w-0">
              {i > 0 && (
                <ChevronRight
                  size={14}
                  aria-hidden="true"
                  style={{ color: 'var(--color-muted)', flexShrink: 0 }}
                />
              )}
              {item.href && !isLast ? (
                <Link
                  href={item.href}
                  className="
                    truncate text-sm font-medium transition-colors duration-fast
                    hover:text-fg focus-visible:outline-none focus-visible:ring-2
                    focus-visible:ring-brand focus-visible:ring-offset-1 rounded
                  "
                  style={{ color: 'var(--color-muted)' }}
                >
                  {item.label}
                </Link>
              ) : (
                <span
                  className="truncate text-sm font-semibold"
                  style={{ color: isLast ? 'var(--color-fg)' : 'var(--color-muted)' }}
                  aria-current={isLast ? 'page' : undefined}
                >
                  {item.label}
                </span>
              )}
            </span>
          );
        })}
      </nav>

      {/* Right side: actions + ⌘K trigger */}
      <div className="flex flex-shrink-0 items-center gap-2">
        {actions}

        <button
          type="button"
          onClick={onOpenCommand}
          aria-label="Open command bar (⌘K)"
          data-testid="topbar-command-btn"
          className="
            hidden items-center gap-1.5 rounded-lg border px-2.5 py-1.5
            text-xs font-medium transition-colors duration-fast
            hover:bg-surface-hover sm:flex
            focus-visible:outline-none focus-visible:ring-2
            focus-visible:ring-brand focus-visible:ring-offset-1
          "
          style={{
            color:       'var(--color-muted)',
            borderColor: 'var(--color-border)',
          }}
        >
          <Command size={12} aria-hidden="true" />
          <span>⌘K</span>
        </button>
      </div>
    </header>
  );
}
