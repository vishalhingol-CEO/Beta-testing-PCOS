/**
 * Sidebar — Application Navigation (G4-SA Updated)
 * ==================================================
 * G4-SA additions:
 * - /workspace as primary navigation item (marked with ⭐)
 * - User identity zone at the bottom (display_name, plan, sign out)
 * - Sign out button calls supabase.auth.signOut()
 *
 * Identity zone reads from ShellContext.session (populated by Shell).
 * If session is null (pre-auth or loading), identity zone renders nothing.
 *
 * @since v0.5.0 Phase H
 * @updated v0.6.0 G4-SA (workspace nav item + identity zone)
 */

'use client';

import { useState, useCallback } from 'react';
import Link                      from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard, Brain, Search, Network,
  GitBranch, Settings2, ChevronLeft, ChevronRight,
  Command, Zap, LogOut,
} from 'lucide-react';
import { useShellContext }  from '@/lib/shell-context';
import { createBrowserClient } from '@/lib/auth/browser-client';

interface NavItem {
  label:  string;
  href:   string;
  icon:   React.ReactNode;
  testId: string;
}

const NAV_ITEMS: NavItem[] = [
  {
    label:  'Workspace',
    href:   '/workspace',
    icon:   <Zap             size={18} aria-hidden="true" />,
    testId: 'sidebar-nav-workspace',
  },
  {
    label:  'Dashboard',
    href:   '/dashboard',
    icon:   <LayoutDashboard size={18} aria-hidden="true" />,
    testId: 'sidebar-nav-dashboard',
  },
  {
    label:  'Memory',
    href:   '/memories',
    icon:   <Brain           size={18} aria-hidden="true" />,
    testId: 'sidebar-nav-memories',
  },
  {
    label:  'Search',
    href:   '/search',
    icon:   <Search          size={18} aria-hidden="true" />,
    testId: 'sidebar-nav-search',
  },
  {
    label:  'Knowledge',
    href:   '/knowledge-graph',
    icon:   <Network         size={18} aria-hidden="true" />,
    testId: 'sidebar-nav-knowledge',
  },
  {
    label:  'Workflow',
    href:   '/workflow',
    icon:   <GitBranch       size={18} aria-hidden="true" />,
    testId: 'sidebar-nav-workflow',
  },
  {
    label:  'Settings',
    href:   '/settings',
    icon:   <Settings2       size={18} aria-hidden="true" />,
    testId: 'sidebar-nav-settings',
  },
];

interface SidebarProps {
  onOpenCommand: () => void;
}

export function Sidebar({ onOpenCommand }: SidebarProps) {
  const pathname              = usePathname();
  const router                = useRouter();
  const { session }           = useShellContext();
  const [collapsed, setCollapsed] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  const handleSignOut = useCallback(async () => {
    setSigningOut(true);
    try {
      const supabase = createBrowserClient();
      await supabase.auth.signOut();
      router.push('/login');
    } catch {
      setSigningOut(false);
    }
  }, [router]);

  const profile = session?.profile;

  return (
    <nav
      aria-label="Main navigation"
      data-testid="sidebar"
      className="relative flex h-full flex-col border-r transition-all duration-normal"
      style={{
        width:           collapsed ? '60px' : '240px',
        borderColor:     'var(--color-border)',
        backgroundColor: 'var(--color-surface)',
        flexShrink:      0,
      }}
    >
      {/* Logo / Brand */}
      <div
        className="flex h-[60px] flex-shrink-0 items-center border-b px-4"
        style={{ borderColor: 'var(--color-border)' }}
      >
        <span
          className="font-bold tracking-tight transition-all duration-normal"
          style={{ color: 'var(--color-brand)', fontSize: collapsed ? '18px' : '16px' }}
          aria-label="PCOS — Personal Cognitive Operating System"
        >
          {collapsed ? 'P' : 'PCOS'}
        </span>
      </div>

      {/* ⌘K command trigger */}
      <div className="px-2 pt-3">
        <button
          type="button"
          onClick={onOpenCommand}
          aria-label="Open command bar (⌘K)"
          data-testid="sidebar-command-btn"
          className="
            flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-xs
            transition-colors duration-fast hover:bg-surface-hover
            focus-visible:outline-none focus-visible:ring-2
            focus-visible:ring-brand focus-visible:ring-offset-1
          "
          style={{
            color:           'var(--color-muted)',
            border:          '1px solid var(--color-border)',
            backgroundColor: 'color-mix(in srgb, var(--color-surface-hover) 50%, transparent)',
          }}
        >
          <Command size={12} aria-hidden="true" className="flex-shrink-0" />
          {!collapsed && <span>Command…</span>}
          {!collapsed && <span className="ml-auto font-mono text-[10px]">⌘K</span>}
        </button>
      </div>

      {/* Navigation items */}
      <ul className="flex flex-1 flex-col gap-0.5 overflow-y-auto px-2 py-3" role="list">
        {NAV_ITEMS.map(item => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
          return (
            <li key={item.href} role="listitem">
              <Link
                href={item.href}
                data-testid={item.testId}
                aria-label={item.label}
                aria-current={isActive ? 'page' : undefined}
                className="
                  flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium
                  transition-colors duration-fast
                  focus-visible:outline-none focus-visible:ring-2
                  focus-visible:ring-brand focus-visible:ring-offset-1
                "
                style={{
                  color: isActive ? 'var(--color-brand)' : 'var(--color-muted)',
                  backgroundColor: isActive
                    ? 'color-mix(in srgb, var(--color-brand) 10%, transparent)'
                    : 'transparent',
                }}
              >
                {item.icon}
                {!collapsed && <span>{item.label}</span>}
              </Link>
            </li>
          );
        })}
      </ul>

      {/* User identity zone — G4-SA addition */}
      {session && (
        <div
          data-zone="user-identity"
          data-testid="sidebar-user-identity"
          className="flex-shrink-0 border-t px-2 py-3"
          style={{ borderColor: 'var(--color-border)' }}
        >
          {!collapsed ? (
            <div className="flex flex-col gap-1">
              {/* Avatar + name */}
              <div className="flex items-center gap-2 px-3 py-1">
                {profile?.avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={profile.avatarUrl}
                    alt=""
                    aria-hidden="true"
                    className="h-6 w-6 flex-shrink-0 rounded-full"
                  />
                ) : (
                  <div
                    className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-white"
                    style={{ backgroundColor: 'var(--color-brand)' }}
                    aria-hidden="true"
                  >
                    {(profile?.displayName?.[0] ?? session.email[0] ?? 'U').toUpperCase()}
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <p
                    className="truncate text-xs font-medium"
                    style={{ color: 'var(--color-fg)' }}
                    data-testid="sidebar-display-name"
                  >
                    {profile?.displayName || session.email.split('@')[0]}
                  </p>
                  <p className="text-[10px]" style={{ color: 'var(--color-muted)' }}>
                    {profile?.plan ?? 'free'} plan
                  </p>
                </div>
              </div>

              {/* Sign out */}
              <button
                type="button"
                onClick={handleSignOut}
                disabled={signingOut}
                data-testid="sidebar-signout-btn"
                aria-label="Sign out of PCOS"
                className="
                  flex w-full items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-medium
                  transition-colors duration-fast hover:bg-surface-hover
                  disabled:opacity-50
                  focus-visible:outline-none focus-visible:ring-2
                  focus-visible:ring-brand focus-visible:ring-offset-1
                "
                style={{ color: 'var(--color-muted)' }}
              >
                <LogOut size={12} aria-hidden="true" />
                {signingOut ? 'Signing out…' : 'Sign out'}
              </button>
            </div>
          ) : (
            /* Collapsed: just show sign out icon */
            <button
              type="button"
              onClick={handleSignOut}
              disabled={signingOut}
              data-testid="sidebar-signout-btn-collapsed"
              aria-label="Sign out"
              className="
                flex w-full items-center justify-center rounded-lg py-2
                transition-colors duration-fast hover:bg-surface-hover
                focus-visible:outline-none focus-visible:ring-2
                focus-visible:ring-brand
              "
              style={{ color: 'var(--color-muted)' }}
            >
              <LogOut size={14} aria-hidden="true" />
            </button>
          )}
        </div>
      )}

      {/* Collapse toggle */}
      <button
        type="button"
        onClick={() => setCollapsed(c => !c)}
        aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        data-testid="sidebar-collapse-btn"
        className="
          absolute -right-3 top-20 flex h-6 w-6 items-center justify-center
          rounded-full border shadow-sm transition-colors duration-fast
          hover:bg-surface-hover
          focus-visible:outline-none focus-visible:ring-2
          focus-visible:ring-brand
        "
        style={{
          backgroundColor: 'var(--color-surface)',
          borderColor:     'var(--color-border)',
          color:           'var(--color-muted)',
        }}
      >
        {collapsed
          ? <ChevronRight size={12} aria-hidden="true" />
          : <ChevronLeft  size={12} aria-hidden="true" />
        }
      </button>
    </nav>
  );
}
