import type { Task, TaskStats, PaginatedResponse } from '@/types/task.types';

export const mockTask: Task = {
  id: 1,
  title: 'Task 1',
  description: null,
  status: 'pending',
  priority: 'medium',
  dueDate: null,
  createdAt: '2026-04-08T00:00:00Z',
  updatedAt: '2026-04-08T00:00:00Z',
};

export const mockTask2: Task = {
  id: 2,
  title: 'Task 2',
  description: 'Second task',
  status: 'in_progress',
  priority: 'high',
  dueDate: '2026-05-01T00:00:00Z',
  createdAt: '2026-04-08T00:00:00Z',
  updatedAt: '2026-04-08T00:00:00Z',
};

export const mockPaginatedTasks: PaginatedResponse<Task> = {
  data: [mockTask, mockTask2],
  meta: { current_page: 1, last_page: 1, per_page: 15, total: 2 },
  links: { first: '', prev: null, next: null, last: '' },
};

export const mockStats: TaskStats = {
  total: 5,
  byStatus: { pending: 3, in_progress: 1, completed: 1 },
  byPriority: { low: 1, medium: 2, high: 2 },
};
