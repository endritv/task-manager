import client from './client';
import type {
  Task,
  TaskStats,
  CreateTaskDto,
  UpdateTaskDto,
  PaginatedResponse,
} from '../types/task.types';

interface ListParams {
  page?: number;
  sort?: string;
  direction?: 'asc' | 'desc';
}

export const tasksApi = {
  getAll: async (params: ListParams = {}): Promise<PaginatedResponse<Task>> => {
    const { data } = await client.get<PaginatedResponse<Task>>('/tasks', { params });
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
