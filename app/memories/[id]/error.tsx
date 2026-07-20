'use client';
import { ErrorState } from '@/components/shared/ErrorState';
export default function MemoryDetailError({ error, reset }: { error: Error; reset: () => void }) {
  return <ErrorState title="Could not load memory" message={error.message} onRetry={reset} />;
}
