/**
 * Edit Memory Page — H-02
 * ========================
 * Pre-filled editor for updating a memory.
 * Shows character diff since edit began.
 *
 * @since v0.5.0 Phase H
 */

'use client';
// Reason: form state, navigation after submit

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Shell }       from '@/components/layout/Shell';
import { TopBar }      from '@/components/layout/TopBar';
import { MemoryForm }  from '@/components/memory/MemoryForm';
import { ErrorState }  from '@/components/shared/ErrorState';
import { Skeleton }    from '@/components/ui/Skeleton';
import { fetchMemory, updateMemory, type MemoryNode } from '@/lib/api/memories';

export default function EditMemoryPage() {
  const router  = useRouter();
  const params  = useParams<{ id: string }>();
  const [memory,    setMemory]    = useState<MemoryNode | null>(null);
  const [loading,   setLoading]   = useState(true);
  const [notFound,  setNotFound]  = useState(false);
  const [submitErr, setSubmitErr] = useState<string | null>(null);

  useEffect(() => {
    fetchMemory(params.id).then(m => {
      if (!m) setNotFound(true);
      else setMemory(m);
    }).catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [params.id]);

  async function handleSubmit({ content, tags }: { content: string; tags: string[] }) {
    setSubmitErr(null);
    try {
      await updateMemory(params.id, { content, tags });
      router.push(`/memories/${params.id}`);
    } catch (err) {
      setSubmitErr(err instanceof Error ? err.message : 'Failed to update. Please try again.');
    }
  }

  return (
    <Shell header={<TopBar
        breadcrumb={[
          { label: 'Memory', href: '/memories' },
          { label: memory?.summary?.slice(0, 30) ?? '…', href: `/memories/${params.id}` },
          { label: 'Edit' },
        ]}
      />}>

      <div className="mx-auto max-w-2xl">
        {loading && <Skeleton className="h-96 rounded-xl" />}

        {notFound && (
          <ErrorState title="Memory not found" message="This memory may have been deleted." />
        )}

        {memory && !loading && (
          <>
            {submitErr && (
              <div
                className="mb-4 rounded-lg border px-4 py-3 text-sm"
                role="alert"
                style={{
                  borderColor:     'color-mix(in srgb, var(--color-danger) 30%, transparent)',
                  backgroundColor: 'color-mix(in srgb, var(--color-danger) 8%, transparent)',
                  color:            'var(--color-danger)',
                }}
              >
                {submitErr}
              </div>
            )}
            <MemoryForm
              initialContent={memory.content}
              initialTags={memory.tags}
              onSubmit={handleSubmit}
              onCancel={() => router.push(`/memories/${params.id}`)}
              submitLabel="Save changes"
            />
          </>
        )}
      </div>
    </Shell>
  );
}
