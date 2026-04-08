import { describe, it, expect, vi } from 'vitest';

describe('client', () => {
  it('uses VITE_API_URL when set', async () => {
    vi.stubEnv('VITE_API_URL', 'https://api.example.com');

    // Re-import to pick up the new env
    vi.resetModules();
    const { default: client } = await import('./client');

    expect(client.defaults.baseURL).toBe('https://api.example.com');

    vi.unstubAllEnvs();
  });

  it('falls back to localhost when VITE_API_URL is not set', async () => {
    vi.stubEnv('VITE_API_URL', '');

    vi.resetModules();
    const { default: client } = await import('./client');

    expect(client.defaults.baseURL).toBe('http://localhost:8000/api');

    vi.unstubAllEnvs();
  });
});
