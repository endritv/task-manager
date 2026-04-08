import axios, { type AxiosError } from 'axios';

interface ApiValidationError {
  message: string;
  errors?: Record<string, string[]>;
}

function isApiValidationError(data: unknown): data is ApiValidationError {
  return typeof data === 'object' && data !== null && 'message' in data;
}

export function getApiError(error: unknown): string {
  if (!axios.isAxiosError(error)) {
    return 'Something went wrong';
  }

  const axiosError: AxiosError<unknown> = error;
  const data = axiosError.response?.data;

  if (isApiValidationError(data)) {
    if (data.errors) {
      const firstError = Object.values(data.errors).flat()[0];
      return firstError ?? 'Validation failed';
    }
    return data.message;
  }

  if (axiosError.code === 'ERR_NETWORK') {
    return 'Unable to connect to the server';
  }

  return 'Something went wrong';
}

export function getFieldErrors(error: unknown): Record<string, string> | null {
  if (!axios.isAxiosError(error)) return null;

  const data = error.response?.data;
  if (!isApiValidationError(data) || !data.errors) return null;

  return Object.fromEntries(
    Object.entries(data.errors).map(([field, messages]) => [field, messages[0]])
  );
}
