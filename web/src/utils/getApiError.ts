import type { AxiosError } from 'axios';

interface ApiValidationError {
  message: string;
  errors?: Record<string, string[]>;
}

export function getApiError(error: unknown): string {
  const axiosError = error as AxiosError<ApiValidationError>;

  if (axiosError.response?.data?.errors) {
    const fieldErrors = Object.values(axiosError.response.data.errors).flat();
    return fieldErrors[0] ?? 'Validation failed';
  }

  if (axiosError.response?.data?.message) {
    return axiosError.response.data.message;
  }

  if (axiosError.code === 'ERR_NETWORK') {
    return 'Unable to connect to the server';
  }

  return 'Something went wrong';
}

export function getFieldErrors(error: unknown): Record<string, string> | null {
  const axiosError = error as AxiosError<ApiValidationError>;
  const errors = axiosError.response?.data?.errors;

  if (!errors) return null;

  return Object.fromEntries(
    Object.entries(errors).map(([field, messages]) => [field, messages[0]])
  );
}
