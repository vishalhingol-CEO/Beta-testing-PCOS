/**
 * ShellContext — Shell-level shared state
 * =========================================
 * G4-SA update: now carries the authenticated session in context
 * so Sidebar can display user identity without prop-drilling.
 *
 * @since v0.5.0 Phase H (openCommand)
 * @updated v0.6.0 G4-SA (added session)
 */
'use client';

import { createContext, useContext } from 'react';
import type { ServerSession } from '@/lib/auth/session';

interface ShellContextValue {
  openCommand: () => void;
  session:     ServerSession | null;
}

export const ShellContext = createContext<ShellContextValue>({
  openCommand: () => {},
  session:     null,
});

export function useShellContext(): ShellContextValue {
  return useContext(ShellContext);
}
