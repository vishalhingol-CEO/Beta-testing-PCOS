/**
 * MemoryForm — Shared Memory Create/Edit Form
 * =============================================
 * Distraction-free editor used in /memories/new and /memories/[id]/edit.
 * Auto-saves draft to localStorage every 30s (key: 'memory-draft').
 * Live token counter estimate (1 token ≈ 4 characters).
 *
 * @param initialContent - Pre-filled content for edit mode
 * @param initialTags    - Pre-filled tags for edit mode
 * @param onSubmit       - Submit handler; receives { content, tags }
 * @param onCancel       - Cancel handler
 * @param submitLabel    - CTA label (default: 'Save memory')
 * @param isLoading      - Submit in-progress state
 *
 * @lifecycle Approved
 * @since v0.5.0 Phase H
 */

'use client';
// Reason: form state, auto-save timer, token counter, tag input

import { useState, useEffect, useRef, useCallback } from 'react';
import { X } from 'lucide-react';

const DRAFT_KEY    = 'memory-draft';
const AUTOSAVE_MS  = 30_000;
const CHARS_PER_TOKEN = 4;

interface MemoryFormProps {
  initialContent?: string;
  initialTags?:    string[];
  onSubmit:        (data: { content: string; tags: string[] }) => Promise<void>;
  onCancel:        () => void;
  submitLabel?:    string;
  isLoading?:      boolean;
}

export function MemoryForm({
  initialContent = '',
  initialTags    = [],
  onSubmit,
  onCancel,
  submitLabel    = 'Save memory',
  isLoading      = false,
}: MemoryFormProps) {
  const [content,    setContent]    = useState(initialContent);
  const [tags,       setTags]       = useState<string[]>(initialTags);
  const [tagInput,   setTagInput]   = useState('');
  const [charDiff,   setCharDiff]   = useState(0);
  const textareaRef  = useRef<HTMLTextAreaElement>(null);
  const timerRef     = useRef<ReturnType<typeof setInterval> | null>(null);
  const isEdit       = initialContent !== '';

  // Track character diff for edit mode
  useEffect(() => {
    if (isEdit) {
      setCharDiff(content.length - initialContent.length);
    }
  }, [content, initialContent, isEdit]);

  // Auto-save draft (create mode only)
  useEffect(() => {
    if (isEdit) return;
    timerRef.current = setInterval(() => {
      try { localStorage.setItem(DRAFT_KEY, JSON.stringify({ content, tags })); }
      catch { /* storage may be unavailable */ }
    }, AUTOSAVE_MS);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [content, tags, isEdit]);

  // Load draft on mount (create mode only)
  useEffect(() => {
    if (isEdit || initialContent) return;
    try {
      const saved = localStorage.getItem(DRAFT_KEY);
      if (saved) {
        const { content: c, tags: t } = JSON.parse(saved) as { content: string; tags: string[] };
        if (c) setContent(c);
        if (t) setTags(t);
      }
    } catch { /* ignore */ }
  }, [isEdit, initialContent]);

  // Auto-focus textarea
  useEffect(() => { textareaRef.current?.focus(); }, []);

  const addTag = useCallback((value: string) => {
    const trimmed = value.trim().toLowerCase().replace(/\s+/g, '-');
    if (trimmed && !tags.includes(trimmed)) {
      setTags(prev => [...prev, trimmed]);
    }
    setTagInput('');
  }, [tags]);

  function handleTagKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTag(tagInput);
    }
    if (e.key === 'Backspace' && !tagInput && tags.length > 0) {
      setTags(prev => prev.slice(0, -1));
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!content.trim()) return;
    await onSubmit({ content: content.trim(), tags });
    // Clear draft on successful create
    if (!isEdit) {
      try { localStorage.removeItem(DRAFT_KEY); } catch { /* ignore */ }
    }
  }

  function handleCancel() {
    if (!isEdit) {
      try { localStorage.removeItem(DRAFT_KEY); } catch { /* ignore */ }
    }
    onCancel();
  }

  const estimatedTokens = Math.ceil(content.length / CHARS_PER_TOKEN);

  return (
    <form
      onSubmit={handleSubmit}
      className="flex h-full flex-col gap-4"
      data-testid="memory-form"
      noValidate
    >
      {/* Content editor */}
      <div className="flex flex-1 flex-col">
        <label htmlFor="memory-content" className="sr-only">
          Memory content
        </label>
        <textarea
          id="memory-content"
          ref={textareaRef}
          name="content"
          value={content}
          onChange={e => setContent(e.target.value)}
          placeholder="Capture a thought, insight, or piece of knowledge…"
          aria-required={true}
          aria-describedby="memory-content-hint"
          data-testid="memory-content-input"
          className="
            w-full flex-1 resize-none rounded-xl border bg-transparent
            px-4 py-4 font-mono text-sm leading-relaxed
            placeholder:text-muted
            focus:outline-none focus:ring-2 focus:ring-brand focus:ring-offset-2
            focus:ring-offset-bg
            transition-colors duration-fast
            min-h-[240px]
          "
          style={{
            borderColor: 'var(--color-border)',
            color:       'var(--color-fg)',
          }}
        />
        <div className="mt-1 flex items-center justify-between">
          <p id="memory-content-hint" className="text-xs" style={{ color: 'var(--color-muted)' }}>
            {isEdit && charDiff !== 0 && (
              <span style={{ color: charDiff > 0 ? 'var(--color-success)' : 'var(--color-danger)' }}>
                {charDiff > 0 ? '+' : ''}{charDiff} chars
              </span>
            )}
          </p>
          <span
            className="font-mono text-[10px] tabular-nums"
            style={{ color: 'var(--color-muted)' }}
            aria-label={`Estimated ${estimatedTokens} tokens`}
          >
            ~{estimatedTokens} tokens
          </span>
        </div>
      </div>

      {/* Tag input */}
      <div className="flex flex-col gap-2">
        <label htmlFor="memory-tags" className="text-xs font-medium" style={{ color: 'var(--color-muted)' }}>
          Tags
        </label>
        <div
          className="flex flex-wrap items-center gap-1.5 rounded-lg border px-3 py-2 focus-within:ring-2 focus-within:ring-brand focus-within:ring-offset-2 focus-within:ring-offset-bg"
          style={{ borderColor: 'var(--color-border)' }}
        >
          {tags.map(tag => (
            <span
              key={tag}
              className="flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium"
              style={{
                backgroundColor: 'color-mix(in srgb, var(--color-brand) 12%, transparent)',
                color:            'var(--color-brand)',
              }}
            >
              {tag}
              <button
                type="button"
                onClick={() => setTags(prev => prev.filter(t => t !== tag))}
                aria-label={`Remove tag ${tag}`}
                data-testid={`tag-remove-${tag}`}
                className="rounded-full focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-brand"
              >
                <X size={10} aria-hidden="true" />
              </button>
            </span>
          ))}
          <input
            id="memory-tags"
            type="text"
            value={tagInput}
            onChange={e => setTagInput(e.target.value)}
            onKeyDown={handleTagKeyDown}
            onBlur={() => { if (tagInput) addTag(tagInput); }}
            placeholder={tags.length === 0 ? 'Add tags (press Enter or comma)' : ''}
            data-testid="memory-tags-input"
            aria-label="Add a tag"
            className="min-w-0 flex-1 bg-transparent text-xs outline-none placeholder:text-muted"
            style={{ color: 'var(--color-fg)' }}
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={handleCancel}
          data-testid="memory-form-cancel-btn"
          className="
            rounded-lg border px-4 py-2 text-sm font-medium
            transition-colors duration-fast hover:bg-surface-hover
            focus-visible:outline-none focus-visible:ring-2
            focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-bg
          "
          style={{ borderColor: 'var(--color-border)', color: 'var(--color-muted)' }}
        >
          Cancel
        </button>

        <button
          type="submit"
          disabled={!content.trim() || isLoading}
          data-testid="memory-form-submit-btn"
          className="
            rounded-lg px-5 py-2 text-sm font-semibold text-white
            transition-all duration-fast
            disabled:cursor-not-allowed disabled:opacity-50
            hover:opacity-90
            focus-visible:outline-none focus-visible:ring-2
            focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-bg
          "
          style={{ backgroundColor: 'var(--color-brand)' }}
        >
          {isLoading ? 'Saving…' : submitLabel}
        </button>
      </div>
    </form>
  );
}
