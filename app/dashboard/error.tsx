'use client';
import { ErrorState } from '@/components/shared/ErrorState';
export default function DashboardError({ error, reset }: { error: Error; reset: () => void }) {
  return <ErrorState title="Could not load dashboard" message={error.message} onRetry={reset} />;
}
