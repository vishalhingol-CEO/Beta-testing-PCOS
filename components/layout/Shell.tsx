/**
 * Shell — Application Shell (G4-SA Updated)
 * ===========================================
 * G4-SA change: accepts optional `session` prop and passes it
 * to ShellContext so Sidebar can display user identity.
 *
 * Architecture:
 * - Shell owns CommandBar state + ⌘K shortcut
 * - Shell renders AmbientStatusStrip, Sidebar, MobileNav
 * - Shell does NOT render TopBar (pages own their TopBar via header prop)
 * - ShellContext provides openCommand + session to all descendants
 *
 * @since v0.5.0 Phase H
 * @updated v0.6.0 G4-SA (session prop added)
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { Sidebar }            from './Sidebar';
import { MobileNav }          from './MobileNav';
import { AmbientStatusStrip } from '@/components/shared/AmbientStatusStrip';
import { CommandBar }         from '@/components/shared/CommandBar';
import { ShellContext }       from '@/lib/shell-context';
import type { ServerSession } from '@/lib/auth/session';

interface ShellProps {
  /** The page's <TopBar> — rendered in the fixed chrome layer. */
  header:    React.ReactNode;
  /** Page content — rendered in the scrollable main area. */
  children:  React.ReactNode;
  /** Authenticated session — passed from page-level getServerSession() */
  session?:  ServerSession | null;
}

export function Shell({ header, children, session = null }: ShellProps) {
  const [commandOpen, setCommandOpen] = useState(false);

  const openCommand  = useCallback(() => setCommandOpen(true),  []);
  const closeCommand = useCallback(() => setCommandOpen(false), []);

  // Global ⌘K / Ctrl+K shortcut
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setCommandOpen(prev => !prev);
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, []);

  return (
    <ShellContext.Provider value={{ openCommand, session }}>
      <div
        className="flex h-screen flex-col overflow-hidden"
        style={{ backgroundColor: 'var(--color-bg)', color: 'var(--color-fg)' }}
      >
        {/* 2px ambient system state strip — always topmost */}
        <AmbientStatusStrip />

        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar: hidden on mobile (<md), MobileNav handles small screens */}
          <div className="hidden md:flex">
            <Sidebar onOpenCommand={openCommand} />
          </div>

          <div className="flex flex-1 flex-col overflow-hidden">
            {/* Chrome layer: exactly the page's TopBar — never duplicated */}
            {header}

            {/* Scrollable content area — pb-16 reserves space for MobileNav on small screens */}
            <main
              id="main-content"
              className="flex-1 overflow-y-auto pb-16 md:pb-0"
              style={{ backgroundColor: 'var(--color-bg)' }}
            >
              <div className="mx-auto max-w-content px-4 py-6 sm:px-6 lg:px-8">
                {children}
              </div>
            </main>
          </div>
        </div>

        {/* Bottom navigation — visible on mobile only (hidden md+) */}
        <MobileNav />

        <CommandBar open={commandOpen} onClose={closeCommand} />
      </div>
    </ShellContext.Provider>
  );
}
