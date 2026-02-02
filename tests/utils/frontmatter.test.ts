import { describe, expect, it } from 'vitest';

import { readingTimeRemarkPlugin } from '../../src/utils/frontmatter.mjs';

describe('readingTimeRemarkPlugin', () => {
  it('adds readingTime to Astro frontmatter', () => {
    const plugin = readingTimeRemarkPlugin();
    const tree = {
      type: 'root',
      children: [{ type: 'text', value: 'Hello world' }],
    };
    const file = {
      data: {
        astro: {
          frontmatter: {},
        },
      },
    };

    plugin(tree, file);

    expect(file.data.astro.frontmatter.readingTime).toBe(1);
  });
});
