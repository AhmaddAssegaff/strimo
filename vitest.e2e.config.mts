import { defineConfig } from 'vitest/config';

export default defineConfig({
  resolve: {
    tsconfigPaths: true,
  },
  test: {
    globals: true,
    environment: 'node',
    include: ['**/*.e2e-spec.ts', 'test/**/*.spec.ts'],
  },
});
