import { describe, it, expect } from 'vitest';
import { getApiError, getFieldErrors } from './getApiError';

describe('getApiError', () => {
  it('extracts first field error from 422 response', () => {
    const error = {
      response: {
        data: {
          message: 'Validation failed',
          errors: { title: ['Title is required', 'Title must be a string'] },
        },
      },
    };
    expect(getApiError(error)).toBe('Title is required');
  });

  it('extracts message from non-validation error', () => {
    const error = {
      response: {
        data: { message: 'Task not found' },
      },
    };
    expect(getApiError(error)).toBe('Task not found');
  });

  it('returns network error message', () => {
    const error = { code: 'ERR_NETWORK' };
    expect(getApiError(error)).toBe('Unable to connect to the server');
  });

  it('returns fallback for unknown errors', () => {
    expect(getApiError({})).toBe('Something went wrong');
  });
});

describe('getFieldErrors', () => {
  it('maps Laravel validation errors to field:message pairs', () => {
    const error = {
      response: {
        data: {
          errors: {
            title: ['Title is required'],
            status: ['Invalid status'],
          },
        },
      },
    };
    const result = getFieldErrors(error);
    expect(result).toEqual({
      title: 'Title is required',
      status: 'Invalid status',
    });
  });

  it('returns null when no field errors exist', () => {
    const error = { response: { data: { message: 'Server error' } } };
    expect(getFieldErrors(error)).toBeNull();
  });

  it('returns null for non-response errors', () => {
    expect(getFieldErrors({})).toBeNull();
  });
});
