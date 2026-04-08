import {describe, expect, it} from 'vitest';
import {AxiosError, AxiosHeaders} from 'axios';
import {getApiError, getFieldErrors} from './getApiError';

function makeAxiosError(status: number, data: unknown, code?: string): AxiosError {
  const headers = new AxiosHeaders();
  const config = { headers };
  return new AxiosError(
      'Request failed',
      code ?? AxiosError.ERR_BAD_REQUEST,
      config,
      null,
      {status, data, headers, config, statusText: 'Error'},
  );
}

describe('getApiError', () => {
  it('extracts first field error from 422 response', () => {
    const error = makeAxiosError(422, {
      message: 'Validation failed',
      errors: { title: ['Title is required', 'Title must be a string'] },
    });
    expect(getApiError(error)).toBe('Title is required');
  });

  it('extracts message from non-validation error', () => {
    const error = makeAxiosError(404, { message: 'Task not found' });
    expect(getApiError(error)).toBe('Task not found');
  });

  it('returns network error message', () => {
    const error = new AxiosError('Network Error', AxiosError.ERR_NETWORK);
    expect(getApiError(error)).toBe('Unable to connect to the server');
  });

  it('returns validation fallback when errors object is empty', () => {
    const error = makeAxiosError(422, {
      message: 'Validation failed',
      errors: {},
    });
    expect(getApiError(error)).toBe('Validation failed');
  });

  it('returns fallback for axios error with non-api response body', () => {
    const error = makeAxiosError(500, '<html>Server Error</html>');
    expect(getApiError(error)).toBe('Something went wrong');
  });

  it('returns fallback for unknown errors', () => {
    expect(getApiError({})).toBe('Something went wrong');
    expect(getApiError(new Error('oops'))).toBe('Something went wrong');
  });
});

describe('getFieldErrors', () => {
  it('maps Laravel validation errors to field:message pairs', () => {
    const error = makeAxiosError(422, {
      message: 'Validation failed',
      errors: {
        title: ['Title is required'],
        status: ['Invalid status'],
      },
    });
    const result = getFieldErrors(error);
    expect(result).toEqual({
      title: 'Title is required',
      status: 'Invalid status',
    });
  });

  it('returns null when no field errors exist', () => {
    const error = makeAxiosError(500, { message: 'Server error' });
    expect(getFieldErrors(error)).toBeNull();
  });

  it('returns null for non-axios errors', () => {
    expect(getFieldErrors({})).toBeNull();
    expect(getFieldErrors(new Error('oops'))).toBeNull();
  });
});
