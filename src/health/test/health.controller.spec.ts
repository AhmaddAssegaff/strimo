/* eslint-disable @typescript-eslint/unbound-method */
import { createMock, type DeepMocked } from '@golevelup/ts-vitest';
import { beforeEach, describe, expect, it } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import {
  DiskHealthIndicator,
  HealthCheckService,
  MemoryHealthIndicator,
} from '@nestjs/terminus';
import { HealthController } from '../health.controller';
import { RedisHealthIndicator } from '../indicators/redis.health';
import { PostgresHealthIndicator } from '../indicators/postgres.health';
import { ObjectStorageHealthIndicator } from '../indicators/object-storage.health';
import { CONSTANTS } from '~app/config';

type HealthCheckIndicators = Parameters<HealthCheckService['check']>[0];

describe('HealthController', () => {
  let healthController: HealthController;

  let config: DeepMocked<ConfigService>;
  let health: DeepMocked<HealthCheckService>;
  let disk: DeepMocked<DiskHealthIndicator>;
  let memory: DeepMocked<MemoryHealthIndicator>;
  let s3Client: DeepMocked<ObjectStorageHealthIndicator>;
  let postgres: DeepMocked<PostgresHealthIndicator>;
  let redis: DeepMocked<RedisHealthIndicator>;
  let indicators: HealthCheckIndicators = [];

  beforeEach(async () => {
    config = createMock<ConfigService>();
    health = createMock<HealthCheckService>();
    disk = createMock<DiskHealthIndicator>();
    memory = createMock<MemoryHealthIndicator>();
    s3Client = createMock<ObjectStorageHealthIndicator>();
    postgres = createMock<PostgresHealthIndicator>();
    redis = createMock<RedisHealthIndicator>();
    indicators = [];

    config.getOrThrow.mockImplementation((key: string) => {
      const values: Record<string, number> = {
        [CONSTANTS.HEALTH.HEALTH_MEMORY_HEAP_LIMIT]: 0.8,
        [CONSTANTS.HEALTH.HEALTH_MEMORY_RSS_LIMIT]: 0.8,
        [CONSTANTS.HEALTH.HEALTH_DISK_THRESHOLD]: 0.9,
      };

      return values[key];
    });

    health.check.mockImplementation(async (checks) => {
      indicators = checks;
      return Promise.resolve({
        status: 'ok',
        info: {},
        error: {},
        details: {},
      });
    });

    const module: TestingModule = await Test.createTestingModule({
      controllers: [HealthController],
      providers: [
        { provide: ConfigService, useValue: config },
        { provide: HealthCheckService, useValue: health },
        { provide: MemoryHealthIndicator, useValue: memory },
        { provide: DiskHealthIndicator, useValue: disk },
        { provide: RedisHealthIndicator, useValue: redis },
        { provide: PostgresHealthIndicator, useValue: postgres },
        { provide: ObjectStorageHealthIndicator, useValue: s3Client },
      ],
    }).compile();

    healthController = module.get(HealthController);
  });

  describe('readiness', () => {
    it('should check redis, postgres, and object-storage', async () => {
      await healthController.readiness();

      expect(health.check).toHaveBeenCalledOnce();
      expect(indicators).toHaveLength(3);

      for (const indicator of indicators) {
        await indicator();
      }

      expect(redis.check).toHaveBeenCalledWith('redis');
      expect(postgres.check).toHaveBeenCalledWith('postgres');
      expect(s3Client.check).toHaveBeenCalledWith('s3Client');
    });
  });

  describe('check', () => {
    it('should check memory heap, memory RSS, and disk storage', async () => {
      const memoryHeapLimit = config.getOrThrow<number>(
        CONSTANTS.HEALTH.HEALTH_MEMORY_HEAP_LIMIT,
      );
      const memoryRSSLimit = config.getOrThrow<number>(
        CONSTANTS.HEALTH.HEALTH_MEMORY_RSS_LIMIT,
      );
      const diskThreshold = config.getOrThrow<number>(
        CONSTANTS.HEALTH.HEALTH_DISK_THRESHOLD,
      );

      await healthController.check();

      expect(health.check).toHaveBeenCalledOnce();
      expect(indicators).toHaveLength(3);

      for (const indicator of indicators) {
        await indicator();
      }

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
