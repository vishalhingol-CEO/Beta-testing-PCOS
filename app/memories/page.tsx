/**
 * Memories Page — H-02 (fixed Shell header prop)
 * @since v0.5.0 Phase H
 */

import { Suspense }        from 'react';
import Link                from 'next/link';
import { Plus, Brain }     from 'lucide-react';
import { Shell }           from '@/components/layout/Shell';
import { TopBar }          from '@/components/layout/TopBar';
import { MemoryCard }      from '@/components/memory/MemoryCard';
import { EmptyState }      from '@/components/shared/EmptyState';
import { ErrorState }      from '@/components/shared/ErrorState';
import { Skeleton }        from '@/components/ui/Skeleton';
import { getServerMemoriesFiltered } from '@/lib/api/server-data';
import { getServerSession } from '@/lib/auth/session';

export const dynamic    = 'force-dynamic';
export const revalidate = 0;

type Status = 'all' | 'processed' | 'processing' | 'failed';
type Sort   = 'newest' | 'oldest';
type View   = 'list' | 'grid';

interface PageProps {
  searchParams: { status?: string; sort?: string; view?: string };
}

const STATUS_TABS: { label: string; value: Status }[] = [
  { label: 'All',        value: 'all'        },
  { label: 'Indexed',    value: 'processed'  },
  { label: 'Processing', value: 'processing' },
  { label: 'Failed',     value: 'failed'     },
];

async function MemoryList({ status, sort, view }: { status: Status; sort: Sort; view: View }) {
  let memories;
  try {
    memories = await getServerMemoriesFiltered({ status, sort, limit: 20 });
  } catch {
    return <ErrorState title="Could not load memories" message="Check your connection and try again." />;
  }

  if (memories.length === 0) {
    return (
      <EmptyState
        icon={<Brain size={24} aria-hidden="true" />}
        title={status === 'all' ? 'No memories yet' : `No ${status} memories`}
        description={status === 'all' ? 'Capture your first thought to start building your knowledge base.' : undefined}
        action={status === 'all' ? { label: 'Capture your first memory', href: '/memories/new' } : undefined}
        size="lg"
      />
    );
  }

  return (
    <div className={view === 'grid' ? 'grid gap-4 sm:grid-cols-2 lg:grid-cols-3' : 'flex flex-col gap-3'}>
      {memories.map(memory => (
        <MemoryCard key={memory.id} memory={memory} variant={view === 'list' ? 'compact' : 'standard'} />
      ))}
    </div>
  );
}

function MemoryListSkeleton({ view }: { view: View }) {
  return (
    <div className={view === 'grid' ? 'grid gap-4 sm:grid-cols-2 lg:grid-cols-3' : 'flex flex-col gap-3'}>
      {Array.from({ length: 6 }).map((_, i) => (
        <Skeleton key={i} className={view === 'list' ? 'h-20 rounded-xl' : 'h-40 rounded-xl'} />
      ))}
    </div>
  );
}

function MemoriesTopBar({ status, sort, view }: { status: Status; sort: Sort; view: View }) {
  return (
    <TopBar
      title="Memory"
      actions={
        <Link
          href="/memories/new"
          data-testid="memories-new-btn"
          aria-label="Capture a new memory"
          className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium text-white transition-opacity duration-fast hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-bg"
          style={{ backgroundColor: 'var(--color-brand)' }}
        >
          <Plus size={14} aria-hidden="true" />
          New
        </Link>
      }
    />
  );
}

export default async function MemoriesPage({ searchParams }: PageProps) {
  const session = await getServerSession();
  const status = (searchParams.status ?? 'all') as Status;
  const sort   = (searchParams.sort   ?? 'newest') as Sort;
  const view   = (searchParams.view   ?? 'list') as View;

  return (
    <Shell header={<MemoriesTopBar status={status} sort={sort} view={view} />} session={session}>
      <div className="flex flex-col gap-4">
        <nav aria-label="Memory filter" className="flex gap-1">
          {STATUS_TABS.map(tab => {
            const params = new URLSearchParams({ status: tab.value, sort, view });
            const isActive = status === tab.value;
            return (
              <Link
                key={tab.value}
                href={`/memories?${params}`}
                data-testid={`filter-tab-${tab.value}`}
                aria-current={isActive ? 'page' : undefined}
                className="rounded-lg px-3 py-1.5 text-xs font-medium transition-colors duration-fast focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-1"
                style={{
                  backgroundColor: isActive ? 'color-mix(in srgb, var(--color-brand) 12%, transparent)' : 'transparent',
                  color: isActive ? 'var(--color-brand)' : 'var(--color-muted)',
                }}
              >
                {tab.label}
              </Link>
            );
          })}
        </nav>
        <Suspense fallback={<MemoryListSkeleton view={view} />}>
          <MemoryList status={status} sort={sort} view={view} />
        </Suspense>
      </div>
    </Shell>
  );
}
