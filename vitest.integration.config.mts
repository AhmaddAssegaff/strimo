import { defineConfig, mergeConfig } from 'vitest/config';
import baseConfig from './vitest.config.mjs';

export default mergeConfig(
  baseConfig,
  defineConfig({
    test: {
      include: ['src/**/*.integration.ts'],
      testTimeout: 30_000,
      hookTimeout: 30_000,
    },
  }),
);
