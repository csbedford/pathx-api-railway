import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['test/**/*.test.ts', 'tests/**/*.test.ts', 'src/**/*.test.ts'],
    coverage: {
      reporter: ['text', 'html'],
    },
  },
});
