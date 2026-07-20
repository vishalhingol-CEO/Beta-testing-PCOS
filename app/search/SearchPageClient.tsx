/**
 * SearchPageClient — uses useSearchParams (client component)
 * Must be wrapped in Suspense at the page level.
 */

'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Brain } from 'lucide-react';
import { SearchBar }     from '@/components/search/SearchBar';
import { SearchResult }  from '@/components/search/SearchResult';
import { EmptyState }    from '@/components/shared/EmptyState';
import { Skeleton }      from '@/components/ui/Skeleton';
import { searchMemories, type SearchResult as SearchResultType } from '@/lib/api/memories';

const DEBOUNCE_MS = 300;

export function SearchPageClient() {
  const router       = useRouter();
  const searchParams = useSearchParams();
  const [query,     setQuery]     = useState(searchParams.get('q') ?? '');
  const [results,   setResults]   = useState<SearchResultType[]>([]);
  const [searching, setSearching] = useState(false);
  const [searched,  setSearched]  = useState(false);
  const [activeIdx, setActiveIdx] = useState(-1);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const doSearch = useCallback(async (q: string) => {
    if (!q.trim()) { setResults([]); setSearched(false); return; }
    setSearching(true);
    try {
      const data = await searchMemories(q);
      setResults(data);
      setSearched(true);
      setActiveIdx(-1);
    } catch { setResults([]); }
    finally { setSearching(false); }
  }, []);

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => doSearch(query), DEBOUNCE_MS);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [query, doSearch]);

  useEffect(() => {
    const params = new URLSearchParams();
    if (query) params.set('q', query);
    router.replace(`/search?${params}`, { scroll: false });
  }, [query, router]);

  function handleKeyDown(e: React.KeyboardEvent) {
    if (results.length === 0) return;
    if (e.key === 'ArrowDown') { e.preventDefault(); setActiveIdx(i => Math.min(i + 1, results.length - 1)); }
    if (e.key === 'ArrowUp')   { e.preventDefault(); setActiveIdx(i => Math.max(i - 1, -1)); }
    if (e.key === 'Enter' && activeIdx >= 0) { router.push(`/memories/${results[activeIdx].id}`); }
  }

  return (
    <div className="flex flex-col gap-6" onKeyDown={handleKeyDown}>
      <SearchBar
        value={query}
        onChange={setQuery}
        isSearching={searching}
        onClear={() => { setQuery(''); setResults([]); setSearched(false); }}
      />

      {searching && (
        <div className="flex flex-col gap-3" aria-busy="true" aria-label="Searching memories">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-28 rounded-xl" />)}
        </div>
      )}

      {!searching && searched && results.length === 0 && (
        <EmptyState
          icon={<Brain size={24} aria-hidden="true" />}
          title={`No results for "${query}"`}
          description="Try different keywords, or capture this as a new memory."
          action={{ label: 'Capture as memory', href: '/memories/new' }}
          size="lg"
        />
      )}

      {!searching && results.length > 0 && (
        <div className="flex flex-col gap-3" role="listbox" aria-label={`${results.length} search results`} data-testid="search-results">
          <p className="text-xs" style={{ color: 'var(--color-muted)' }}>
            {results.length} {results.length === 1 ? 'result' : 'results'} for &ldquo;{query}&rdquo;
          </p>
          {results.map((result, i) => (
            <SearchResult key={result.id} result={result} isActive={i === activeIdx} onSelect={() => router.push(`/memories/${result.id}`)} />
          ))}
        </div>
      )}

      {!query && !searched && (
        <div className="flex flex-col items-center gap-3 py-16 text-center">
          <Brain size={32} aria-hidden="true" style={{ color: 'var(--color-muted)' }} />
          <p className="text-sm" style={{ color: 'var(--color-muted)' }}>
            Search across your <span style={{ color: 'var(--color-fg)' }}>memory knowledge base</span>
          </p>
        </div>
      )}
    </div>
  );
}
