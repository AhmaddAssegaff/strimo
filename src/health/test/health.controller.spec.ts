import { Test, TestingModule } from '@nestjs/testing';
import { HealthController } from '../health.controller';
import {
  MockHealthConfigService,
  MockHealthDiskHealthIndicator,
  MockHealthHealthCheckService,
  MockHealthMemoryHealthIndicator,
  MockHealthMinioHealthIndicator,
  MockHealthPostgresHealthIndicator,
  MockHealthRedisHealthIndicator,
} from './health.type.mock';
import {
  createMockHealthConfigService,
  createMockHealthDiskHealthIndicator,
  createMockHealthHealthCheckService,
  createMockHealthMemoryHealthIndicator,
  createMockHealthMinioHealthIndicator,
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
import { MinioHealthIndicator } from '../indicators/minio.health';
import { CONSTANTS } from '~app/config';

describe('HealthController', () => {
  let healthController: HealthController;
  let config: MockHealthConfigService;
  let health: MockHealthHealthCheckService;
  let disk: MockHealthDiskHealthIndicator;
  let memory: MockHealthMemoryHealthIndicator;
  let minio: MockHealthMinioHealthIndicator;
  let postgres: MockHealthPostgresHealthIndicator;
  let redis: MockHealthRedisHealthIndicator;

  beforeEach(async () => {
    config = createMockHealthConfigService();
    health = createMockHealthHealthCheckService();
    disk = createMockHealthDiskHealthIndicator();
    memory = createMockHealthMemoryHealthIndicator();
    minio = createMockHealthMinioHealthIndicator();
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
          provide: MinioHealthIndicator,
          useValue: minio,
        },
      ],
    }).compile();

    healthController = module.get<HealthController>(HealthController);
  });

  describe('readiness', () => {
    it('should check redis, postgres, and minio', async () => {
      await healthController.readiness();

      expect(health.check).toHaveBeenCalledTimes(1);

      const [indicators] = health.check.mock.calls[0];

      expect(indicators).toHaveLength(3);

      await indicators[0]();
      await indicators[1]();
      await indicators[2]();

      expect(redis.check).toHaveBeenCalledWith('redis');
      expect(postgres.check).toHaveBeenCalledWith('postgres');
      expect(minio.check).toHaveBeenCalledWith('minio');
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
