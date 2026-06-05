import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/**/*.test.ts'],
    // CRITICAL: Prevent parallel execution from clashing database rows
    fileParallelism: false,
    alias: {
      '#src': path.resolve(__dirname, './src'),
    },
  },
});