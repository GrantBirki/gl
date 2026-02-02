import { describe, expect, it, vi } from 'vitest';

const loadUtils = async (formatter = { format: () => 'formatted' }) => {
  vi.resetModules();
  vi.doMock('~/config/site/config.js', () => ({
    DATE_FORMATTER: formatter,
  }));
  return await import('../../src/utils/utils');
};

describe('utils', () => {
  it('formats dates using the configured formatter', async () => {
    const { getFormattedDate } = await loadUtils({ format: () => 'formatted' });

    expect(getFormattedDate(new Date('2020-01-02T00:00:00Z'))).toBe('formatted');
  });

  it('returns an empty string for falsy dates', async () => {
    const { getFormattedDate } = await loadUtils({ format: () => 'formatted' });

    expect(getFormattedDate(undefined as unknown as Date)).toBe('');
  });

  it('trims custom characters from both ends', async () => {
    const { trim } = await loadUtils();

    expect(trim('///hello//', '/')).toBe('hello');
    expect(trim('hello', '/')).toBe('hello');
  });

  it('returns the original string when no trim character is provided', async () => {
    const { trim } = await loadUtils();

    expect(trim('  hello  ')).toBe('  hello  ');
    expect(trim()).toBe('');
  });
});
