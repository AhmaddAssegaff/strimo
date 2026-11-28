import { defineConfig, mergeConfig } from 'vitest/config';
import baseConfig from './vitest.config.mjs';

export default mergeConfig(
  baseConfig,
  defineConfig({
    test: {
      include: ['src/**/*.spec.ts'],
      coverage: {
        enabled: true,
        provider: 'v8',
        reportOnFailure: false,
        reportsDirectory: './coverage',
        reporter: ['text', 'html'],
        include: ['src/**/*.ts'],
        exclude: [
          'src/**/*.spec.ts',
          'src/**/*.interface.ts',
          'src/**/*.dto.ts',
          'src/**/*.config.ts',
        ],
      },
    },
  }),
);
