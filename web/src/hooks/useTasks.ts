import { useState, useEffect, useCallback } from 'react';
import { tasksApi } from '../api/tasks.api';
import type {
  Task,
  CreateTaskDto,
  UpdateTaskDto,
  PaginationMeta,
  SortField,
  SortDirection,
  TaskStatus,
  TaskPriority,
} from '../types/task.types';

export interface UseTasksReturn {
  tasks: Task[];
  meta: PaginationMeta | null;
  loading: boolean;
  error: string | null;
  page: number;
  setPage: (page: number) => void;
  perPage: number;
  setPerPage: (perPage: number) => void;
  sortBy: SortField;
  setSortBy: (sort: SortField) => void;
  direction: SortDirection;
  setDirection: (dir: SortDirection) => void;
  search: string;
  setSearch: (query: string) => void;
  statusFilter: TaskStatus | undefined;
  setStatusFilter: (status: TaskStatus | undefined) => void;
  priorityFilter: TaskPriority | undefined;
  setPriorityFilter: (priority: TaskPriority | undefined) => void;
  createTask: (dto: CreateTaskDto) => Promise<Task>;
  updateTask: (id: number, dto: UpdateTaskDto) => Promise<Task>;
  deleteTask: (id: number) => Promise<void>;
  refetch: () => Promise<void>;
}

export function useTasks(): UseTasksReturn {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(15);
  const [sortBy, setSortBy] = useState<SortField>('created_at');
  const [direction, setDirection] = useState<SortDirection>('desc');
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<TaskStatus | undefined>();
  const [priorityFilter, setPriorityFilter] = useState<TaskPriority | undefined>();

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(timer);
  }, [search]);

  const fetchTasks = useCallback(async (): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      const response = await tasksApi.getAll({
        page,
        perPage,
        sort: sortBy,
        direction,
        search: debouncedSearch || undefined,
        status: statusFilter,
        priority: priorityFilter,
      });
      setTasks(response.data);
      setMeta(response.meta);
    } catch {
      setError('Failed to load tasks');
    } finally {
      setLoading(false);
    }
  }, [page, perPage, sortBy, direction, debouncedSearch, statusFilter, priorityFilter]);

  const createTask = async (dto: CreateTaskDto): Promise<Task> => {
    const task = await tasksApi.create(dto);
    await fetchTasks();
    return task;
  };

  const updateTask = async (id: number, dto: UpdateTaskDto): Promise<Task> => {
    const task = await tasksApi.update(id, dto);
    setTasks((prev) => prev.map((t) => (t.id === id ? task : t)));
    return task;
  };

  const deleteTask = async (id: number): Promise<void> => {
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
    perPage,
    setPerPage,
    sortBy,
    setSortBy,
    direction,
    setDirection,
    search,
    setSearch,
    statusFilter,
    setStatusFilter,
    priorityFilter,
    setPriorityFilter,
    createTask,
    updateTask,
    deleteTask,
    refetch: fetchTasks,
  };
}
