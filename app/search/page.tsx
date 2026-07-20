/**
 * Search Page — H-03 (fixed: useSearchParams wrapped in Suspense)
 * @since v0.5.0 Phase H
 */

import { Suspense } from 'react';
import { Skeleton } from '@/components/ui/Skeleton';
import { getServerSession } from '@/lib/auth/session';
import { Shell }    from '@/components/layout/Shell';
import { TopBar }   from '@/components/layout/TopBar';
import { SearchPageClient } from './SearchPageClient';

export default async function SearchPage() {
  const session = await getServerSession();
  return (
    <Shell header={<TopBar title="Search" />} session={session}>
      <Suspense fallback={
        <div className="flex flex-col gap-4">
          <Skeleton className="h-14 rounded-2xl" />
          <Skeleton className="h-32 rounded-xl" />
          <Skeleton className="h-32 rounded-xl" />
        </div>
      }>
        <SearchPageClient />
      </Suspense>
    </Shell>
  );
}
