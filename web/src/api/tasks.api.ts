import client from './client';
import type {
  Task,
  TaskStats,
  CreateTaskDto,
  UpdateTaskDto,
  PaginatedResponse,
  SortField,
  SortDirection,
  TaskStatus,
  TaskPriority,
} from '../types/task.types';

export interface ListParams {
  page?: number;
  perPage?: number;
  sort?: SortField;
  direction?: SortDirection;
  search?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
}

export const tasksApi = {
  getAll: async (params: ListParams = {}): Promise<PaginatedResponse<Task>> => {
    const { page, perPage: per_page, sort, direction, search, status, priority } = params;
    const { data } = await client.get<PaginatedResponse<Task>>('/tasks', {
      params: { page, per_page, sort, direction, search, status, priority },
    });
    return data;
  },

  getById: async (id: number): Promise<Task> => {
    const { data } = await client.get<{ data: Task }>(`/tasks/${id}`);
    return data.data;
  },

  create: async (dto: CreateTaskDto): Promise<Task> => {
    const { data } = await client.post<{ data: Task }>('/tasks', dto);
    return data.data;
  },

  update: async (id: number, dto: UpdateTaskDto): Promise<Task> => {
    const { data } = await client.put<{ data: Task }>(`/tasks/${id}`, dto);
    return data.data;
  },

  delete: async (id: number): Promise<void> => {
    await client.delete(`/tasks/${id}`);
  },

  stats: async (): Promise<TaskStats> => {
    const { data } = await client.get<TaskStats>('/tasks/stats');
    return data;
  },
};
