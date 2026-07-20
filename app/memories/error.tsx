'use client';
import { ErrorState } from '@/components/shared/ErrorState';
export default function MemoryError({ error, reset }: { error: Error; reset: () => void }) {
  return <ErrorState title="Could not load memories" message={error.message} onRetry={reset} />;
}
