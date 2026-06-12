import type { Config } from 'jest';

const config: Config = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: 'src',
  testRegex: '.*\\.spec\\.ts$',
  transform: {
    '^.+\\.(t|j)s$': 'ts-jest',
  },
  collectCoverageFrom: ['**/*.(t|j)s'],
  coverageDirectory: '../coverage',
  testEnvironment: 'node',
  moduleNameMapper: {
    '^~app/(.*)$': '<rootDir>/$1',
    '^~config/(.*)$': '<rootDir>/config/$1',
    '^~modules/(.*)$': '<rootDir>/modules/$1',
    '^~core/(.*)$': '<rootDir>/core/$1',
    '^~typeorm/(.*)$': '<rootDir>/core/typeorm/$1',
    '^~minio/(.*)$': '<rootDir>/core/minio/$1',
    '^~smtp/(.*)$': '<rootDir>/core/smtp/$1',
    '^~bullmq/(.*)$': '<rootDir>/core/bullmq/$1',
    '^~redis/(.*)$': '<rootDir>/core/redis/$1',
  },
};

export default config;
