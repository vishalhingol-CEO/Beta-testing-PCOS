/**
 * New Memory Page — H-02
 * =======================
 * Distraction-free memory creation editor.
 * Auto-save to localStorage every 30s.
 *
 * @since v0.5.0 Phase H
 */

'use client';
// Reason: form interaction, navigation after submit

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Shell }       from '@/components/layout/Shell';
import { TopBar }      from '@/components/layout/TopBar';
import { MemoryForm }  from '@/components/memory/MemoryForm';
import { createMemory } from '@/lib/api/memories';

export default function NewMemoryPage() {
  const router    = useRouter();
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit({ content, tags }: { content: string; tags: string[] }) {
    setError(null);
    try {
      const memory = await createMemory({ content, tags });
      router.push(`/memories/${memory.id}?processing=true`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save memory. Please try again.');
    }
  }

  return (
    <Shell header={<TopBar
        breadcrumb={[
          { label: 'Memory', href: '/memories' },
          { label: 'New' },
        ]}
      />}>

      <div className="mx-auto max-w-2xl">
        <div className="mb-6">
          <h1 className="text-xl font-bold" style={{ color: 'var(--color-fg)' }}>
            Capture a memory
          </h1>
          <p className="mt-1 text-sm" style={{ color: 'var(--color-muted)' }}>
            Write anything — an idea, insight, fact, or reflection. PCOS will index it.
          </p>
        </div>

        {error && (
          <div
            className="mb-4 rounded-lg border px-4 py-3 text-sm"
            role="alert"
            style={{
              borderColor:     'color-mix(in srgb, var(--color-danger) 30%, transparent)',
              backgroundColor: 'color-mix(in srgb, var(--color-danger) 8%, transparent)',
              color:            'var(--color-danger)',
            }}
          >
            {error}
          </div>
        )}

        <MemoryForm
          onSubmit={handleSubmit}
          onCancel={() => router.push('/memories')}
          submitLabel="Save memory"
        />
      </div>
    </Shell>
  );
}
