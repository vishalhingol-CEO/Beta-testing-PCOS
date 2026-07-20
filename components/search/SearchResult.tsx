/**
 * SearchResult — Memory search result card with similarity bar
 * =============================================================
 * Variant of MemoryCard with ConfidenceBar instead of ProcessingBadge.
 * Similarity scores shown as labels only — NEVER raw decimals.
 *
 * @param result   - SearchResult (MemoryNode + similarity)
 * @param isActive - Whether this item is keyboard-selected
 * @param onSelect - Navigation handler
 *
 * @lifecycle Approved
 * @since v0.5.0 Phase H
 */

import Link from 'next/link';
import { ConfidenceBar } from '@/components/intelligence/ConfidenceBar';
import type { SearchResult as SearchResultType } from '@/lib/api/memories';

interface SearchResultProps {
  result:   SearchResultType;
  isActive: boolean;
  onSelect: (id: string) => void;
}

export function SearchResult({ result, isActive, onSelect }: SearchResultProps) {
  const preview = (result.summary ?? result.content).slice(0, 160);

  return (
    <Link
      href={`/memories/${result.id}`}
      onClick={() => onSelect(result.id)}
      data-testid={`search-result-${result.id}`}
      aria-selected={isActive}
      className="
        group flex flex-col gap-3 rounded-xl border p-4
        transition-all duration-fast
        hover:border-brand/30 hover:bg-surface-hover
        focus-visible:outline-none focus-visible:ring-2
        focus-visible:ring-brand focus-visible:ring-offset-2
        focus-visible:ring-offset-bg
      "
      style={{
        borderColor:     isActive ? 'color-mix(in srgb, var(--color-brand) 40%, transparent)' : 'var(--color-border)',
        backgroundColor: isActive ? 'color-mix(in srgb, var(--color-brand) 6%, transparent)' : 'transparent',
      }}
    >
      <p
        className="text-sm font-medium leading-snug"
        style={{ color: 'var(--color-fg)' }}
      >
        {preview}{preview.length < (result.summary ?? result.content).length ? '…' : ''}
      </p>

      {result.tags.length > 0 && (
        <div className="flex flex-wrap gap-1" role="list" aria-label="Tags">
          {result.tags.slice(0, 5).map(tag => (
            <span
              key={tag}
              role="listitem"
              className="rounded-full px-2 py-0.5 text-[10px] font-medium"
              style={{
                backgroundColor: 'color-mix(in srgb, var(--color-brand) 10%, transparent)',
                color:            'var(--color-brand)',
              }}
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      <ConfidenceBar
        score={result.similarity}
        size="xs"
        showLabel={true}
        showScore={false}
      />
    </Link>
  );
}
