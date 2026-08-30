import { Test, TestingModule } from '@nestjs/testing';
import { HealthIndicatorService } from '@nestjs/terminus';
import { RedisHealthIndicator } from '~app/health/indicators/redis.health';
import { RedisService } from '~app/infra/redis/redis.service';
import {
  MockHealthIndicatorService,
  MockRedisService,
} from '../health.type.mock';
import {
  createMockHealthIndicatorService,
  createMockRedisService,
} from '../health.factory.mock';

describe('RedisHealthIndicator', () => {
  let redisHealthIndicator: RedisHealthIndicator;
  let health: MockHealthIndicatorService;
  let redis: MockRedisService;

  beforeEach(async () => {
    health = createMockHealthIndicatorService();
    redis = createMockRedisService();

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

    redisHealthIndicator =
      module.get<RedisHealthIndicator>(RedisHealthIndicator);
  });

  describe('check', () => {
    it('should return up when redis is healthy', async () => {
      await redisHealthIndicator.check('redis');

      expect(redis.ping).toHaveBeenCalled();
      expect(health.indicator.up).toHaveBeenCalled();
    });

    it('should return down when redis is unhealthy', async () => {
      redis.ping.mockRejectedValueOnce(new Error('Redis connection failed'));

      await redisHealthIndicator.check('redis');

      expect(redis.ping).toHaveBeenCalled();
      expect(health.indicator.down).toHaveBeenCalledWith({
        message: 'Redis connection failed',
      });
    });
  });
});
