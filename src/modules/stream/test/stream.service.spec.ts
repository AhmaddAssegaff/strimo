/* eslint-disable @typescript-eslint/unbound-method */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Test, TestingModule } from '@nestjs/testing';
import { StreamService } from '../stream.service';
import { RedisService } from '~app/infra/redis/redis.service';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { CACHE_KEY } from '~app/infra/redis/redis.constants';
import { ForbiddenException } from '@nestjs/common';

describe('StreamService', () => {
  let service: StreamService;
  let redis: DeepMocked<RedisService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [StreamService],
    })
      .useMocker(createMock)
      .compile();

    service = module.get(StreamService);
    redis = module.get(RedisService);
  });

  describe('authorizedStream', () => {
    const videoId = '4aaca657-7c2c-429e-8f5d-239b22f1e07a';
    const cache = CACHE_KEY.video.session(videoId);

    it('should call redis.lazyLoadCache', async () => {
      await service.authorizedStream(videoId);

      expect(redis.lazyLoadCache).toHaveBeenCalledTimes(1);
      expect(redis.lazyLoadCache).toHaveBeenCalledWith({
        cacheKey: cache.key,
        load: expect.any(Function),
        opts: {
          ttlSeconds: cache.ttlSeconds,
        },
      });
    });

    it('should throw ForbiddenException when video session not found', async () => {
      redis.lazyLoadCache.mockResolvedValue(null);

      await expect(service.authorizedStream(videoId)).rejects.toThrow(
        ForbiddenException,
      );
    });
  });
});
