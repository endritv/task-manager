import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { useTasks } from './useTasks';
import { tasksApi } from '../api/tasks.api';
import { mockTask, mockPaginatedTasks } from '../test/fixtures';

vi.mock('../api/tasks.api');

const mockedApi = vi.mocked(tasksApi);

beforeEach(() => {
  mockedApi.getAll.mockResolvedValue(mockPaginatedTasks);
});

describe('useTasks', () => {
  it('fetches tasks on mount', async () => {
    const { result } = renderHook(() => useTasks());

    expect(result.current.loading).toBe(true);

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.tasks).toHaveLength(1);
    expect(result.current.tasks[0].title).toBe('Task 1');
    expect(mockedApi.getAll).toHaveBeenCalledOnce();
  });

  it('sets error when fetch fails', async () => {
    mockedApi.getAll.mockRejectedValueOnce(new Error('Network error'));

    const { result } = renderHook(() => useTasks());

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.error).toBe('Failed to load tasks');
    expect(result.current.tasks).toHaveLength(0);
  });

  it('creates a task and refetches', async () => {
    mockedApi.create.mockResolvedValue(mockTask);

    const { result } = renderHook(() => useTasks());
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.createTask({
        title: 'New', description: null, status: 'pending', priority: 'medium', dueDate: null,
      });
    });

    expect(mockedApi.create).toHaveBeenCalledOnce();
    expect(mockedApi.getAll).toHaveBeenCalledTimes(2);
  });

  it('deletes a task optimistically', async () => {
    mockedApi.delete.mockResolvedValue(undefined);

    const { result } = renderHook(() => useTasks());
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.deleteTask(1);
    });

    expect(result.current.tasks).toHaveLength(0);
    expect(mockedApi.delete).toHaveBeenCalledWith(1);
  });

  it('updates a task in place', async () => {
    const updated = { ...mockTask, title: 'Updated' };
    mockedApi.update.mockResolvedValue(updated);

    const { result } = renderHook(() => useTasks());
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.updateTask(1, { title: 'Updated' });
    });

    expect(result.current.tasks[0].title).toBe('Updated');
  });

  it('returns meta for pagination', async () => {
    const { result } = renderHook(() => useTasks());
    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.meta).toEqual(mockPaginatedTasks.meta);
  });

  it('refetches when page changes', async () => {
    const { result } = renderHook(() => useTasks());
    await waitFor(() => expect(result.current.loading).toBe(false));

    act(() => result.current.setPage(2));

    await waitFor(() => expect(mockedApi.getAll).toHaveBeenCalledTimes(2));
  });

  it('refetches when sort changes', async () => {
    const { result } = renderHook(() => useTasks());
    await waitFor(() => expect(result.current.loading).toBe(false));

    act(() => result.current.setSortBy('title'));

    await waitFor(() => expect(mockedApi.getAll).toHaveBeenCalledTimes(2));
  });

  it('refetches when perPage changes', async () => {
    const { result } = renderHook(() => useTasks());
    await waitFor(() => expect(result.current.loading).toBe(false));

    act(() => result.current.setPerPage(25));

    await waitFor(() => expect(mockedApi.getAll).toHaveBeenCalledTimes(2));
  });
});
