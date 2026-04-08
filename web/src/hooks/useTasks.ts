import { useState, useEffect, useCallback } from 'react';
import { tasksApi } from '../api/tasks.api';
import type { Task, CreateTaskDto, UpdateTaskDto, PaginatedResponse } from '../types/task.types';

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [meta, setMeta] = useState<PaginatedResponse<Task>['meta'] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState('created_at');
  const [direction, setDirection] = useState<'asc' | 'desc'>('desc');

  const fetchTasks = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await tasksApi.getAll({ page, sort: sortBy, direction });
      setTasks(response.data);
      setMeta(response.meta);
    } catch {
      setError('Failed to load tasks');
    } finally {
      setLoading(false);
    }
  }, [page, sortBy, direction]);

  const createTask = async (dto: CreateTaskDto) => {
    const task = await tasksApi.create(dto);
    await fetchTasks();
    return task;
  };

  const updateTask = async (id: number, dto: UpdateTaskDto) => {
    const task = await tasksApi.update(id, dto);
    setTasks((prev) => prev.map((t) => (t.id === id ? task : t)));
    return task;
  };

  const deleteTask = async (id: number) => {
    await tasksApi.delete(id);
    setTasks((prev) => prev.filter((t) => t.id !== id));
  };

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  return {
    tasks,
    meta,
    loading,
    error,
    page,
    setPage,
    sortBy,
    setSortBy,
    direction,
    setDirection,
    createTask,
    updateTask,
    deleteTask,
    refetch: fetchTasks,
  };
}
