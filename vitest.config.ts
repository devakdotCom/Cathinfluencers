import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'jsdom',
    setupFiles: ['./tests/setup.ts'],
    exclude: ['tests/*.rules.test.ts', 'tests/e2e/**', 'node_modules/**', 'dist/**'],
    coverage: {
      reporter: ['text', 'html'],
      include: ['src/features/**/*.ts', 'src/repositories/**/*.ts', 'src/schemas/**/*.ts'],
    },
  },
});
