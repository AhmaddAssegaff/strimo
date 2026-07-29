import { CONSTANTS } from '~app/config';
import {
  MockHealthConfigService,
  MockHealthDiskHealthIndicator,
  MockHealthHealthCheckService,
  MockHealthIndicatorService,
  MockHealthMemoryHealthIndicator,
  MockHealthObjectStorageHealthIndicator,
  MockHealthPostgresHealthIndicator,
  MockHealthRedisHealthIndicator,
  MockObjectStorageService,
  MockPrismaService,
  MockRedisService,
} from './health.type.mock';

// Factories for health controller unit tests.
// Used to create mocked dependencies for HealthController.
const MEMORY_HEAP_LIMIT = 0.8;
const MEMORY_RSS_LIMIT = 0.8;
const DISK_THRESHOLD = 0.9;

export function createMockHealthConfigService(): MockHealthConfigService {
  const values: Record<string, number> = {
    [CONSTANTS.HEALTH.HEALTH_MEMORY_HEAP_LIMIT]: MEMORY_HEAP_LIMIT,
    [CONSTANTS.HEALTH.HEALTH_MEMORY_RSS_LIMIT]: MEMORY_RSS_LIMIT,
    [CONSTANTS.HEALTH.HEALTH_DISK_THRESHOLD]: DISK_THRESHOLD,
  };

  return {
    getOrThrow: jest.fn((key: string) => values[key]),
  };
}

export function createMockHealthDiskHealthIndicator(): MockHealthDiskHealthIndicator {
  return {
    checkStorage: jest.fn(),
  };
}

export function createMockHealthHealthCheckService(): MockHealthHealthCheckService {
  return {
    check: jest.fn().mockResolvedValue({}),
  };
}

export function createMockHealthMemoryHealthIndicator(): MockHealthMemoryHealthIndicator {
  return {
    checkHeap: jest.fn(),
    checkRSS: jest.fn(),
  };
}

export function createMockHealthObjectStorageHealthIndicator(): MockHealthObjectStorageHealthIndicator {
  return {
    check: jest.fn(),
  };
}

export function createMockHealthPostgresHealthIndicator(): MockHealthPostgresHealthIndicator {
  return {
    check: jest.fn(),
  };
}

export function createMockHealthRedisHealthIndicator(): MockHealthRedisHealthIndicator {
  return {
    check: jest.fn(),
  };
}

// Factories for health indicator unit tests.
// Used to create mocked dependencies of each health indicator.
export function createMockObjectStorageService(): MockObjectStorageService {
  return {
    ping: jest.fn(),
  };
}

export function createMockPrismaService(): MockPrismaService {
  return {
    ping: jest.fn(),
  };
}

export function createMockRedisService(): MockRedisService {
  return {
    ping: jest.fn(),
  };
}

export function createMockHealthIndicatorService(): MockHealthIndicatorService {
  const indicator: MockHealthIndicatorService['indicator'] = {
    up: jest.fn(),
    down: jest.fn(),
  };

  return {
    check: jest.fn().mockReturnValue(indicator),
    indicator,
  };
}
