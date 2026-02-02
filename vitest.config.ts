import path from 'path';
import { fileURLToPath } from 'url';
import { defineConfig } from 'vitest/config';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  resolve: {
    alias: {
      '~': path.resolve(__dirname, 'src'),
    },
  },
  test: {
    environment: 'node',
    include: ['tests/**/*.test.{js,ts}'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'text-summary'],
      all: true,
      include: ['src/utils/blog.ts', 'src/utils/frontmatter.mjs', 'src/utils/permalinks.ts', 'src/utils/utils.ts'],
      thresholds: {
        lines: 100,
        functions: 100,
        statements: 100,
        branches: 98,
      },
    },
  },
});
