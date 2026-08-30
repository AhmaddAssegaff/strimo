import { ForbiddenException, Injectable } from '@nestjs/common';
import { StreamRepository } from './stream.repository';
import { RedisService } from '~app/infra/redis/redis.service';
import { CACHE_KEY } from '~app/infra/redis/redis.constants';
import { VideoResult } from './interface/stream.interface';

@Injectable()
export class StreamService {
  constructor(
    private readonly redis: RedisService,
    private readonly streamRepo: StreamRepository,
  ) {}

  async authorizedStream(videoId: string): Promise<VideoResult | null> {
    const cache = CACHE_KEY.video.session(videoId);

    const video = await this.redis.lazyLoadCache({
      cacheKey: cache.key,
      load: () => this.streamRepo.selectVideoPolicy(videoId),
      opts: {
        ttlSeconds: cache.ttlSeconds,
      },
    });

    if (!video) {
      throw new ForbiddenException(
        'you dont have permisson to acces this video',
      );
    }

    return video;
  }
}
