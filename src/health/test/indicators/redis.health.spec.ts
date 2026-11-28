/* eslint-disable @typescript-eslint/unbound-method */
import { createMock, type DeepMocked } from '@golevelup/ts-vitest';
import { beforeEach, describe, expect, it } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { HealthIndicatorService } from '@nestjs/terminus';
import { RedisHealthIndicator } from '~app/health/indicators/redis.health';
import { RedisService } from '~app/infra/redis/redis.service';

describe('RedisHealthIndicator', () => {
  let redisHealthIndicator: RedisHealthIndicator;
  let health: DeepMocked<HealthIndicatorService>;
  let redis: DeepMocked<RedisService>;

  beforeEach(async () => {
    health = createMock<HealthIndicatorService>();
    redis = createMock<RedisService>();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RedisHealthIndicator,
        {
          provide: HealthIndicatorService,
          useValue: health,
        },
        {
          provide: RedisService,
          useValue: redis,
        },
      ],
    }).compile();

    redisHealthIndicator = module.get(RedisHealthIndicator);
  });

  describe('check', () => {
    it('should return up when redis is healthy', async () => {
      await redisHealthIndicator.check('redis');

      expect(redis.ping).toHaveBeenCalledOnce();
      expect(health.check).toHaveBeenCalledWith('redis');
    });

    it('should return down when redis is unhealthy', async () => {
      redis.ping.mockRejectedValueOnce(new Error('Redis connection failed'));

      await redisHealthIndicator.check('redis');

      expect(redis.ping).toHaveBeenCalledOnce();
    });
  });
});
