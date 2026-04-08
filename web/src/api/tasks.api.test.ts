import { describe, it, expect, vi, beforeEach } from 'vitest';
import { tasksApi } from './tasks.api';
import client from './client';

vi.mock('./client');

const mockedClient = vi.mocked(client);

beforeEach(() => {
  vi.clearAllMocks();
});

describe('tasksApi.getAll', () => {
  it('fetches paginated tasks', async () => {
    const mockResponse = {
      data: {
        data: [{ id: 1, title: 'Task 1' }],
        meta: { current_page: 1, last_page: 1, per_page: 15, total: 1 },
        links: { first: '', prev: null, next: null, last: '' },
      },
    };
    mockedClient.get.mockResolvedValue(mockResponse);

    const result = await tasksApi.getAll({ page: 1, sort: 'created_at', direction: 'desc' });

    expect(mockedClient.get).toHaveBeenCalledWith('/tasks', {
      params: { page: 1, per_page: undefined, sort: 'created_at', direction: 'desc' },
    });
    expect(result.data[0].title).toBe('Task 1');
  });

  it('passes per_page parameter', async () => {
    mockedClient.get.mockResolvedValue({ data: { data: [], meta: {}, links: {} } });

    await tasksApi.getAll({ perPage: 25 });

    expect(mockedClient.get).toHaveBeenCalledWith('/tasks', {
      params: expect.objectContaining({ per_page: 25 }),
    });
  });
});

describe('tasksApi.getById', () => {
  it('unwraps the data envelope', async () => {
    mockedClient.get.mockResolvedValue({
      data: { data: { id: 1, title: 'Task 1' } },
    });

    const result = await tasksApi.getById(1);

    expect(mockedClient.get).toHaveBeenCalledWith('/tasks/1');
    expect(result.title).toBe('Task 1');
  });
});

describe('tasksApi.create', () => {
  it('posts and unwraps the response', async () => {
    const dto = { title: 'New', description: null, status: 'pending' as const, priority: 'medium' as const, dueDate: null };
    mockedClient.post.mockResolvedValue({
      data: { data: { id: 1, ...dto } },
    });

    const result = await tasksApi.create(dto);

    expect(mockedClient.post).toHaveBeenCalledWith('/tasks', dto);
    expect(result.title).toBe('New');
  });
});

describe('tasksApi.update', () => {
  it('puts and unwraps the response', async () => {
    mockedClient.put.mockResolvedValue({
      data: { data: { id: 1, title: 'Updated' } },
    });

    const result = await tasksApi.update(1, { title: 'Updated' });

    expect(mockedClient.put).toHaveBeenCalledWith('/tasks/1', { title: 'Updated' });
    expect(result.title).toBe('Updated');
  });
});

describe('tasksApi.delete', () => {
  it('calls delete endpoint', async () => {
    mockedClient.delete.mockResolvedValue({});

    await tasksApi.delete(1);

    expect(mockedClient.delete).toHaveBeenCalledWith('/tasks/1');
  });
});

describe('tasksApi.stats', () => {
  it('fetches stats without data envelope', async () => {
    const stats = { total: 5, byStatus: { pending: 3 }, byPriority: { high: 2 } };
    mockedClient.get.mockResolvedValue({ data: stats });

    const result = await tasksApi.stats();

    expect(mockedClient.get).toHaveBeenCalledWith('/tasks/stats');
    expect(result.total).toBe(5);
  });
});
