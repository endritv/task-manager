import type { ReactElement } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { useTaskStats } from '@/hooks/useTaskStats';

const statusLabels = {
  pending: 'Pending',
  in_progress: 'In Progress',
  completed: 'Completed',
} as const;

const priorityLabels = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
} as const;

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-800',
  in_progress: 'bg-blue-100 text-blue-800',
  completed: 'bg-green-100 text-green-800',
} as const;

const priorityColors = {
  low: 'bg-green-100 text-green-800',
  medium: 'bg-yellow-100 text-yellow-800',
  high: 'bg-red-100 text-red-800',
} as const;

export function Dashboard(): ReactElement | null {
  const { stats, loading, error } = useTaskStats();

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-36" />
        <div className="rounded-lg border bg-card p-6 shadow-sm space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-10 w-16" />
        </div>
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i}>
            <Skeleton className="mb-3 h-6 w-28" />
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4">
              {Array.from({ length: 3 }).map((_, j) => (
                <div key={j} className="rounded-lg border bg-card p-4 shadow-sm space-y-2">
                  <div className="flex items-center justify-between">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-5 w-16 rounded-full" />
                  </div>
                  <Skeleton className="h-9 w-10" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center p-12">
        <p className="text-destructive">{error}</p>
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>

      {/* Total */}
      <div className="rounded-lg border bg-card p-6 shadow-sm">
        <p className="text-sm text-muted-foreground">Total Tasks</p>
        <p className="text-4xl font-bold text-card-foreground">{stats.totalTasks}</p>
      </div>

      {/* By Status */}
      <div>
        <h2 className="mb-3 text-lg font-semibold">By Status</h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4">
          {(Object.entries(statusLabels) as [keyof typeof statusLabels, string][]).map(
            ([key, label]) => (
              <div key={key} className="rounded-lg border bg-card p-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">{label}</p>
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusColors[key]}`}>
                    {key.replace('_', ' ')}
                  </span>
                </div>
                <p className="mt-2 text-3xl font-bold text-card-foreground">
                  {stats.byStatus[key] ?? 0}
                </p>
              </div>
            )
          )}
        </div>
      </div>

      {/* By Priority */}
      <div>
        <h2 className="mb-3 text-lg font-semibold">By Priority</h2>
        <div className="grid grid-cols-3 gap-4">
          {(Object.entries(priorityLabels) as [keyof typeof priorityLabels, string][]).map(
            ([key, label]) => (
              <div key={key} className="rounded-lg border bg-card p-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">{label}</p>
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${priorityColors[key]}`}>
                    {key}
                  </span>
                </div>
                <p className="mt-2 text-3xl font-bold text-card-foreground">
                  {stats.byPriority[key] ?? 0}
                </p>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
}
