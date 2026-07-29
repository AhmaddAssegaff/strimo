import type { Config } from 'jest';

const config: Config = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: 'src',
  testRegex: '.*\\.spec\\.ts$',
  transform: {
    '^.+\\.(t|j)s$': 'ts-jest',
  },
  // collectCoverageFrom: ['**/*.ts'],
  coverageDirectory: '../coverage',
  testEnvironment: 'node',
  moduleNameMapper: {
    '^~app/(.*)$': '<rootDir>/$1',
    '^~config/(.*)$': '<rootDir>/config/$1',
    '^~modules/(.*)$': '<rootDir>/modules/$1',
    '^~core/(.*)$': '<rootDir>/core/$1',
    '^~typeorm/(.*)$': '<rootDir>/core/typeorm/$1',
    '^~s3/(.*)$': '<rootDir>/core/object-storage/$1',
    '^~smtp/(.*)$': '<rootDir>/core/smtp/$1',
    '^~bullmq/(.*)$': '<rootDir>/core/bullmq/$1',
    '^~redis/(.*)$': '<rootDir>/core/redis/$1',
  },
  collectCoverageFrom: [
    '**/*.ts',
    '!**/*.module.ts',
    '!main.ts',
    '!**/*.dto.ts',
    '!**/index.ts',
    '!**/*.constant.ts',
    '!**/*.spec.ts',
    '!**/*.mock.ts',
  ],
  coverageReporters: ['text', 'text-summary', 'html', 'lcov'],
};

export default config;
