import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    testTimeout: 60000,
    hookTimeout: 60000,
    coverage: {
      reporter: ['text', 'html'],
      exclude: ['node_modules/', 'tests/', 'src/config/'],
    },
    setupFiles: ['./tests/setup.js'],
  },
});