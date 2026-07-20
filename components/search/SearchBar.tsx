/**
 * SearchBar — Semantic Search Input
 * ===================================
 * Debounced search with IntelligenceStatus 'researching' state while active.
 * Keyboard: Escape clears input.
 *
 * @param value       - Controlled input value
 * @param onChange    - Value change handler
 * @param isSearching - Whether a search is in progress
 * @param onClear     - Clear handler
 *
 * @lifecycle Approved
 * @since v0.5.0 Phase H
 */

'use client';
// Reason: keyboard handler, focus management

import { useRef } from 'react';
import { Search, X } from 'lucide-react';
import { IntelligenceStatus } from '@/components/intelligence/IntelligenceStatus';

interface SearchBarProps {
  value:       string;
  onChange:    (value: string) => void;
  isSearching: boolean;
  onClear:     () => void;
  placeholder?: string;
}

export function SearchBar({
  value,
  onChange,
  isSearching,
  onClear,
  placeholder = 'Search your memories…',
}: SearchBarProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Escape') {
      onClear();
      inputRef.current?.blur();
    }
  }

  return (
    <div
      className="
        relative flex items-center gap-3 rounded-2xl border px-4 py-3
        transition-all duration-fast
        focus-within:ring-2 focus-within:ring-brand
        focus-within:ring-offset-2 focus-within:ring-offset-bg
      "
      style={{
        borderColor:     'var(--color-border)',
        backgroundColor: 'var(--color-surface)',
      }}
    >
      {/* Leading icon — shows status when searching */}
      {isSearching ? (
        <IntelligenceStatus
          state="researching"
          size="sm"
          showLabel={false}
          aria-hidden="true"
        />
      ) : (
        <Search size={18} aria-hidden="true" style={{ color: 'var(--color-muted)', flexShrink: 0 }} />
      )}

      <label htmlFor="search-input" className="sr-only">Search memories</label>
      <input
        id="search-input"
        ref={inputRef}
        type="search"
        value={value}
        onChange={e => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        aria-label="Search memories"
        data-testid="search-input"
        autoComplete="off"
        className="
          flex-1 bg-transparent text-base outline-none
          placeholder:text-muted
        "
        style={{ color: 'var(--color-fg)' }}
      />

      {value && (
        <button
          type="button"
          onClick={onClear}
          aria-label="Clear search"
          data-testid="search-clear-btn"
          className="
            flex-shrink-0 rounded p-0.5
            transition-colors duration-fast hover:bg-surface-hover
            focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand
          "
        >
          <X size={16} aria-hidden="true" style={{ color: 'var(--color-muted)' }} />
        </button>
      )}
    </div>
  );
}
