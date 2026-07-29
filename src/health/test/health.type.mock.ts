import {
  DiskHealthIndicator,
  HealthIndicatorResult,
  MemoryHealthIndicator,
} from '@nestjs/terminus';

import { RedisHealthIndicator } from '../indicators/redis.health';
import { PostgresHealthIndicator } from '../indicators/postgres.health';
import { ObjectStorageHealthIndicator } from '../indicators/object-storage.health';

import { ObjectStorageService } from '~app/core/object-storage/object-storage.service';
import { PrismaService } from '~app/core/prisma/prisma.service';
import { RedisService } from '~app/core/redis/redis.service';

// Mock types for HealthController unit tests.
// Each type keeps only the dependency methods used by HealthController.
export type MockHealthConfigService = {
  getOrThrow: jest.MockedFunction<(key: string) => number>;
};

export type MockHealthHealthCheckService = {
  check: jest.MockedFunction<
    (indicators: (() => Promise<HealthIndicatorResult>)[]) => Promise<unknown>
  >;
};

export type MockHealthMemoryHealthIndicator = jest.Mocked<
  Pick<MemoryHealthIndicator, 'checkHeap' | 'checkRSS'>
>;

export type MockHealthDiskHealthIndicator = jest.Mocked<
  Pick<DiskHealthIndicator, 'checkStorage'>
>;

export type MockHealthRedisHealthIndicator = jest.Mocked<
  Pick<RedisHealthIndicator, 'check'>
>;

export type MockHealthPostgresHealthIndicator = jest.Mocked<
  Pick<PostgresHealthIndicator, 'check'>
>;

export type MockHealthObjectStorageHealthIndicator = jest.Mocked<
  Pick<ObjectStorageHealthIndicator, 'check'>
>;

// Mock types for ObjectStorageHealthIndicator unit tests.
// Each type keeps only the dependency methods used by ObjectStorageHealthIndicator.
export type MockObjectStorageService = jest.Mocked<
  Pick<ObjectStorageService, 'ping'>
>;

// Mock types for PostgresHealthIndicator unit tests.
// Each type keeps only the dependency methods used by PostgresHealthIndicator.
export type MockPrismaService = jest.Mocked<Pick<PrismaService, 'ping'>>;

// Mock types for RedisHealthIndicator unit tests.
// Each type keeps only the dependency methods used by RedisHealthIndicator.
export type MockRedisService = jest.Mocked<Pick<RedisService, 'ping'>>;

export type MockHealthIndicator = {
  up: jest.Mock;
  down: jest.Mock;
};

export type MockHealthIndicatorService = {
  check: jest.MockedFunction<(key: string) => MockHealthIndicator>;
  indicator: MockHealthIndicator;
};
