import { Test, TestingModule } from '@nestjs/testing';
import { HealthController } from '../health.controller';
import {
  MockHealthConfigService,
  MockHealthDiskHealthIndicator,
  MockHealthHealthCheckService,
  MockHealthMemoryHealthIndicator,
  MockHealthObjectStorageHealthIndicator,
  MockHealthPostgresHealthIndicator,
  MockHealthRedisHealthIndicator,
} from './health.type.mock';
import {
  createMockHealthConfigService,
  createMockHealthDiskHealthIndicator,
  createMockHealthHealthCheckService,
  createMockHealthMemoryHealthIndicator,
  createMockHealthObjectStorageHealthIndicator,
  createMockHealthPostgresHealthIndicator,
  createMockHealthRedisHealthIndicator,
} from './health.factory.mock';
import { ConfigService } from '@nestjs/config';
import {
  DiskHealthIndicator,
  HealthCheckService,
  MemoryHealthIndicator,
} from '@nestjs/terminus';
import { RedisHealthIndicator } from '../indicators/redis.health';
import { PostgresHealthIndicator } from '../indicators/postgres.health';
import { ObjectStorageHealthIndicator } from '../indicators/object-storage.health';
import { CONSTANTS } from '~app/config';

describe('HealthController', () => {
  let healthController: HealthController;
  let config: MockHealthConfigService;
  let health: MockHealthHealthCheckService;
  let disk: MockHealthDiskHealthIndicator;
  let memory: MockHealthMemoryHealthIndicator;
  let s3Client: MockHealthObjectStorageHealthIndicator;
  let postgres: MockHealthPostgresHealthIndicator;
  let redis: MockHealthRedisHealthIndicator;

  beforeEach(async () => {
    config = createMockHealthConfigService();
    health = createMockHealthHealthCheckService();
    disk = createMockHealthDiskHealthIndicator();
    memory = createMockHealthMemoryHealthIndicator();
    s3Client = createMockHealthObjectStorageHealthIndicator();
    postgres = createMockHealthPostgresHealthIndicator();
    redis = createMockHealthRedisHealthIndicator();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [HealthController],
      providers: [
        {
          provide: ConfigService,
          useValue: config,
        },
        {
          provide: HealthCheckService,
          useValue: health,
        },
        {
          provide: MemoryHealthIndicator,
          useValue: memory,
        },
        {
          provide: DiskHealthIndicator,
          useValue: disk,
        },
        {
          provide: RedisHealthIndicator,
          useValue: redis,
        },
        {
          provide: PostgresHealthIndicator,
          useValue: postgres,
        },
        {
          provide: ObjectStorageHealthIndicator,
          useValue: s3Client,
        },
      ],
    }).compile();

    healthController = module.get<HealthController>(HealthController);
  });

  describe('readiness', () => {
    it('should check redis, postgres, and object-storage', async () => {
      await healthController.readiness();

      expect(health.check).toHaveBeenCalledTimes(1);

      const [indicators] = health.check.mock.calls[0];

      expect(indicators).toHaveLength(3);

      await indicators[0]();
      await indicators[1]();
      await indicators[2]();

      expect(redis.check).toHaveBeenCalledWith('redis');
      expect(postgres.check).toHaveBeenCalledWith('postgres');
      expect(s3Client.check).toHaveBeenCalledWith('s3Client');
    });
  });

  describe('check', () => {
    it('should check memory checkHeap, checkRSS and check disk storage', async () => {
      const memoryHeapLimit = config.getOrThrow(
        CONSTANTS.HEALTH.HEALTH_MEMORY_HEAP_LIMIT,
      );
      const memoryRSSLimit = config.getOrThrow(
        CONSTANTS.HEALTH.HEALTH_MEMORY_RSS_LIMIT,
      );
      const diskThreshold = config.getOrThrow(
        CONSTANTS.HEALTH.HEALTH_DISK_THRESHOLD,
      );

      await healthController.check();
      const [indicators] = health.check.mock.calls[0];

      expect(indicators).toHaveLength(3);

      await indicators[0]();
      await indicators[1]();
      await indicators[2]();

      expect(memory.checkHeap).toHaveBeenCalledWith(
        'memory_heap',
        memoryHeapLimit,
      );

      expect(memory.checkRSS).toHaveBeenCalledWith(
        'memory_rss',
        memoryRSSLimit,
      );

      expect(disk.checkStorage).toHaveBeenCalledWith('disk', {
        path: '/',
        thresholdPercent: diskThreshold,
      });
    });
  });
});
