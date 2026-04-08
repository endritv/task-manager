import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useTaskStats } from './useTaskStats';
import { tasksApi } from '../api/tasks.api';
import { mockStats } from '../test/fixtures';

vi.mock('../api/tasks.api');

const mockedApi = vi.mocked(tasksApi);

beforeEach(() => {
  mockedApi.stats.mockResolvedValue(mockStats);
});

describe('useTaskStats', () => {
  it('fetches stats on mount', async () => {
    const { result } = renderHook(() => useTaskStats());

    expect(result.current.loading).toBe(true);

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.stats).toEqual(mockStats);
    expect(result.current.stats?.totalTasks).toBe(5);
  });

  it('sets error when stats fetch fails', async () => {
    mockedApi.stats.mockRejectedValueOnce(new Error('Failed'));

    const { result } = renderHook(() => useTaskStats());

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.error).toBe('Failed to load stats');
    expect(result.current.stats).toBeNull();
  });
});
