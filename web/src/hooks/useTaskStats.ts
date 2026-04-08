import { useState, useEffect } from 'react';
import { tasksApi } from '../api/tasks.api';
import type { TaskStats } from '../types/task.types';

export interface UseTaskStatsReturn {
  stats: TaskStats | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useTaskStats(): UseTaskStatsReturn {
  const [stats, setStats] = useState<TaskStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async (): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      const data = await tasksApi.stats();
      setStats(data);
    } catch {
      setError('Failed to load stats');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return { stats, loading, error, refetch: fetchStats };
}
