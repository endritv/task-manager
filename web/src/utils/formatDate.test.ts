import { describe, it, expect } from 'vitest';
import { formatDate } from './formatDate';

describe('formatDate', () => {
  it('formats a valid ISO date string', () => {
    expect(formatDate('2026-04-07T00:00:00Z')).toBe('Apr 7, 2026');
  });

  it('returns null for null input', () => {
    expect(formatDate(null)).toBeNull();
  });

  it('returns null for empty string', () => {
    expect(formatDate('')).toBeNull();
  });

  it('formats a date with time component', () => {
    const result = formatDate('2026-12-25T14:30:00Z');
    expect(result).toBe('Dec 25, 2026');
  });
});
