/**
 * CommandBar — Global Command Surface (⌘K)
 * ==========================================
 * QA-H-010: Correct accessible focus trap implemented.
 * - Tab/Shift+Tab cycles only within the dialog
 * - Escape closes and restores focus to the element that opened the bar
 * - Initial focus: search input
 * - Focus restoration: returns to trigger element on close
 * - No heavy dependency — pure DOM focus management
 *
 * @lifecycle Approved — QA-H-010 remediation
 * @since v0.5.0 Phase H
 */

'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  Search, Brain, Plus, Settings2, Network,
  GitBranch, Zap, X,
} from 'lucide-react';

interface CommandItem {
  id:       string;
  label:    string;
  shortcut?: string;
  icon:     React.ReactNode;
  action:   () => void;
  group:    string;
}

interface CommandBarProps {
  open:    boolean;
  onClose: () => void;
}

// All focusable element selectors within the dialog
const FOCUSABLE = [
  'input',
  'button:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(', ');

export function CommandBar({ open, onClose }: CommandBarProps) {
  const router           = useRouter();
  const inputRef         = useRef<HTMLInputElement>(null);
  const dialogRef        = useRef<HTMLDivElement>(null);
  const listRef          = useRef<HTMLUListElement>(null);
  const triggerRef       = useRef<Element | null>(null);
  const [query, setQuery]       = useState('');
  const [selected, setSelected] = useState(0);

  const navigate = useCallback((path: string) => {
    router.push(path);
    onClose();
  }, [router, onClose]);

  const COMMANDS: CommandItem[] = [
    { id: 'new-memory',   label: 'Capture a memory',        group: 'Create',   icon: <Plus       size={16} aria-hidden="true" />, action: () => navigate('/memories/new')     },
    { id: 'go-dashboard', label: 'Go to Dashboard',         group: 'Navigate', icon: <Zap        size={16} aria-hidden="true" />, action: () => navigate('/dashboard'),  shortcut: 'G D' },
    { id: 'go-memories',  label: 'Go to Memories',          group: 'Navigate', icon: <Brain      size={16} aria-hidden="true" />, action: () => navigate('/memories'),   shortcut: 'G M' },
    { id: 'go-search',    label: 'Go to Search',            group: 'Navigate', icon: <Search     size={16} aria-hidden="true" />, action: () => navigate('/search'),     shortcut: 'G S' },
    { id: 'go-graph',     label: 'Go to Knowledge Graph',   group: 'Navigate', icon: <Network    size={16} aria-hidden="true" />, action: () => navigate('/knowledge-graph'), shortcut: 'G K' },
    { id: 'go-workflow',  label: 'Go to Workflow',          group: 'Navigate', icon: <GitBranch  size={16} aria-hidden="true" />, action: () => navigate('/workflow'),   shortcut: 'G W' },
    { id: 'go-settings',  label: 'Go to Settings',          group: 'Navigate', icon: <Settings2  size={16} aria-hidden="true" />, action: () => navigate('/settings')         },
  ];

  const filtered = query.trim()
    ? COMMANDS.filter(c => c.label.toLowerCase().includes(query.toLowerCase()))
    : COMMANDS;

  // On open: save trigger, focus input
  useEffect(() => {
    if (open) {
      triggerRef.current = document.activeElement;
      setQuery('');
      setSelected(0);
      // Small delay ensures the dialog is rendered before focusing
      const id = setTimeout(() => inputRef.current?.focus(), 20);
      return () => clearTimeout(id);
    } else {
      // Restore focus to trigger element on close
      if (triggerRef.current && typeof (triggerRef.current as HTMLElement).focus === 'function') {
        (triggerRef.current as HTMLElement).focus();
        triggerRef.current = null;
      }
    }
  }, [open]);

  // Clamp selection
  useEffect(() => {
    setSelected(s => Math.min(s, Math.max(0, filtered.length - 1)));
  }, [filtered.length]);

  // Focus trap: Tab / Shift+Tab cycles within dialog
  const handleFocusTrap = useCallback((e: React.KeyboardEvent) => {
    if (e.key !== 'Tab') return;
    const dialog = dialogRef.current;
    if (!dialog) return;
    const focusable = Array.from(dialog.querySelectorAll<HTMLElement>(FOCUSABLE));
    if (focusable.length === 0) return;
    const first = focusable[0];
    const last  = focusable[focusable.length - 1];
    if (e.shiftKey) {
      if (document.activeElement === first) {
        e.preventDefault();
        last.focus();
      }
    } else {
      if (document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  }, []);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    handleFocusTrap(e);
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelected(s => Math.min(s + 1, filtered.length - 1));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelected(s => Math.max(s - 1, 0));
        break;
      case 'Enter':
        e.preventDefault();
        filtered[selected]?.action();
        break;
      case 'Escape':
        onClose();
        break;
    }
  }, [filtered, selected, onClose, handleFocusTrap]);

  // Scroll selected item into view
  useEffect(() => {
    const el = listRef.current?.children[selected] as HTMLElement | undefined;
    el?.scrollIntoView({ block: 'nearest' });
  }, [selected]);

  if (!open) return null;

  const groups = Array.from(new Set(filtered.map(c => c.group)));

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Dialog */}
      <div
        ref={dialogRef}
        role="dialog"
        aria-label="Command bar"
        aria-modal="true"
        data-testid="command-bar"
        onKeyDown={handleKeyDown}
        className="
          fixed left-1/2 top-[20vh] z-50 w-full max-w-lg -translate-x-1/2
          overflow-hidden rounded-2xl shadow-xl
        "
        style={{
          background:      'var(--glass-bg)',
          backdropFilter:  'blur(var(--glass-blur)) saturate(var(--glass-saturate))',
          border:          '1px solid var(--glass-border)',
        }}
      >
        {/* Search input */}
        <div
          className="flex items-center gap-3 border-b px-4 py-3.5"
          style={{ borderColor: 'var(--color-border)' }}
        >
          <Search size={16} className="flex-shrink-0" style={{ color: 'var(--color-muted)' }} aria-hidden="true" />
          <label htmlFor="command-bar-input" className="sr-only">Search commands</label>
          <input
            id="command-bar-input"
            ref={inputRef}
            type="text"
            value={query}
            onChange={e => { setQuery(e.target.value); setSelected(0); }}
            placeholder="Type a command or search…"
            aria-autocomplete="list"
            aria-controls="command-bar-list"
            aria-activedescendant={filtered[selected] ? `cmd-${filtered[selected].id}` : undefined}
            data-testid="command-bar-input"
            className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted"
            style={{ color: 'var(--color-fg)' }}
          />
          <button
            type="button"
            onClick={onClose}
            aria-label="Close command bar"
            data-testid="command-bar-close-btn"
            className="flex-shrink-0 rounded p-0.5 transition-colors hover:bg-surface-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
          >
            <X size={14} aria-hidden="true" style={{ color: 'var(--color-muted)' }} />
          </button>
        </div>

        {/* Results */}
        <ul
          id="command-bar-list"
          ref={listRef}
          role="listbox"
          aria-label="Commands"
          className="max-h-72 overflow-y-auto py-2"
        >
          {filtered.length === 0 && (
            <li className="px-4 py-8 text-center text-sm text-muted" role="option" aria-selected="false">
              No commands match &ldquo;{query}&rdquo;
            </li>
          )}
          {groups.map(group => {
            const items = filtered.filter(c => c.group === group);
            return (
              <li key={group} role="presentation">
                <p className="px-4 pb-1 pt-2 text-[10px] font-semibold uppercase tracking-widest text-muted">
                  {group}
                </p>
                <ul role="group" aria-label={group}>
                  {items.map(cmd => {
                    const idx = filtered.indexOf(cmd);
                    const isSelected = idx === selected;
                    return (
                      <li
                        key={cmd.id}
                        id={`cmd-${cmd.id}`}
                        role="option"
                        aria-selected={isSelected}
                        data-testid={`command-item-${cmd.id}`}
                        onClick={cmd.action}
                        onMouseEnter={() => setSelected(idx)}
                        className="mx-2 flex cursor-pointer items-center justify-between rounded-lg px-3 py-2 transition-colors duration-fast"
                        style={{
                          backgroundColor: isSelected
                            ? 'color-mix(in srgb, var(--color-brand) 12%, transparent)'
                            : 'transparent',
                        }}
                      >
                        <span className="flex items-center gap-3">
                          <span style={{ color: isSelected ? 'var(--color-brand)' : 'var(--color-muted)' }}>
                            {cmd.icon}
                          </span>
                          <span className="text-sm" style={{ color: 'var(--color-fg)' }}>
                            {cmd.label}
                          </span>
                        </span>
                        {cmd.shortcut && (
                          <span className="font-mono text-[10px] text-muted">{cmd.shortcut}</span>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </li>
            );
          })}
        </ul>

        {/* Footer */}
        <div className="flex items-center gap-4 border-t px-4 py-2" style={{ borderColor: 'var(--color-border)' }}>
          <span className="text-[10px] text-muted">↑↓ navigate</span>
          <span className="text-[10px] text-muted">↵ select</span>
          <span className="text-[10px] text-muted">esc close</span>
          <span className="text-[10px] text-muted">tab cycle</span>
        </div>
      </div>
    </>
  );
}
