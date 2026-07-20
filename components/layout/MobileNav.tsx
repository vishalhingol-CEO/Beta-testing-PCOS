/**
 * MobileNav — Ultra-Mobile Bottom Navigation
 * ============================================
 * QA-H-013: Bottom navigation bar for 320–480px viewports.
 * Hidden on md+ (tablet and desktop use Sidebar).
 *
 * Shows 4 primary navigation items as icon buttons.
 * ⌘K is replaced by a '+' capture action on mobile.
 *
 * Verified at: 320px, 375px, 480px
 *
 * @lifecycle Approved — QA-H-013 remediation
 * @since v0.5.0 Phase H
 */

'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Brain, Search, Plus } from 'lucide-react';

interface MobileNavItem {
  label:  string;
  href:   string;
  icon:   React.ReactNode;
  testId: string;
}

const MOBILE_NAV: MobileNavItem[] = [
  {
    label:  'Dashboard',
    href:   '/dashboard',
    icon:   <LayoutDashboard size={20} aria-hidden="true" />,
    testId: 'mobile-nav-dashboard',
  },
  {
    label:  'Memory',
    href:   '/memories',
    icon:   <Brain size={20} aria-hidden="true" />,
    testId: 'mobile-nav-memories',
  },
  {
    label:  'Capture',
    href:   '/memories/new',
    icon:   <Plus size={20} aria-hidden="true" />,
    testId: 'mobile-nav-capture',
  },
  {
    label:  'Search',
    href:   '/search',
    icon:   <Search size={20} aria-hidden="true" />,
    testId: 'mobile-nav-search',
  },
];

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Mobile navigation"
      data-testid="mobile-nav"
      className="
        fixed bottom-0 left-0 right-0 z-40 flex h-16 items-center
        justify-around border-t md:hidden
      "
      style={{
        backgroundColor: 'var(--color-surface)',
        borderColor:     'var(--color-border)',
        /* Safe area for notched phones */
        paddingBottom:   'env(safe-area-inset-bottom)',
      }}
    >
      {MOBILE_NAV.map(item => {
        const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
        const isCapture = item.href === '/memories/new';

        return (
          <Link
            key={item.href}
            href={item.href}
            data-testid={item.testId}
            aria-label={item.label}
            aria-current={isActive ? 'page' : undefined}
            className={`
              flex flex-col items-center gap-1 rounded-xl px-4 py-2
              transition-colors duration-fast min-w-[56px]
              focus-visible:outline-none focus-visible:ring-2
              focus-visible:ring-brand focus-visible:ring-offset-2
              focus-visible:ring-offset-bg
              ${isCapture ? 'mx-1' : ''}
            `}
          >
            <span
              className={`
                flex items-center justify-center rounded-xl
                ${isCapture ? 'h-10 w-10' : 'h-8 w-8'}
              `}
              style={{
                backgroundColor: isCapture
                  ? 'var(--color-brand)'
                  : isActive
                  ? 'color-mix(in srgb, var(--color-brand) 12%, transparent)'
                  : 'transparent',
                color: isCapture
                  ? 'white'
                  : isActive
                  ? 'var(--color-brand)'
                  : 'var(--color-muted)',
              }}
            >
              {item.icon}
            </span>
            <span
              className="text-[10px] font-medium leading-none"
              style={{
                color: isActive && !isCapture ? 'var(--color-brand)' : 'var(--color-muted)',
              }}
            >
              {item.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
