import { defineConfig, mergeConfig } from 'vitest/config';
import baseConfig from './vitest.config.mjs';

export default mergeConfig(
  baseConfig,
  defineConfig({
    resolve: {
      tsconfigPaths: true,
    },
    test: {
      globals: true,
      environment: 'node',
      include: ['**/*.e2e-spec.ts'],
    },
  }),
);
