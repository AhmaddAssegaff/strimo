import {
  Inject,
  Injectable,
  Logger,
  OnApplicationShutdown,
} from '@nestjs/common';
import Redis from 'ioredis';
import { CACHE_REDIS_CLIENT } from '~redis/redis.constants';

@Injectable()
export class RedisService implements OnApplicationShutdown {
  constructor(
    @Inject(CACHE_REDIS_CLIENT)
    private readonly redis: Redis,
  ) {}

  async onApplicationShutdown(signal?: string) {
    if (signal === 'SIGTERM') {
      Logger.log('Application shutting down');
    }

    await this.redis.quit();
  }

  async get(key: string): Promise<string | null> {
    try {
      return await this.redis.get(key);
    } catch {
      return null;
    }
  }

  async set(key: string, value: string, ttlSeconds?: number) {
    if (ttlSeconds) {
      await this.redis.set(key, value, 'EX', ttlSeconds);
      return;
    }

    await this.redis.set(key, value);
  }

  async del(key: string) {
    return this.redis.del(key);
  }
}
