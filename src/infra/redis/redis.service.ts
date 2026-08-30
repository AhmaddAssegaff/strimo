import {
  Inject,
  Injectable,
  Logger,
  OnApplicationShutdown,
} from '@nestjs/common';
import Redis from 'ioredis';
import { CACHE_REDIS_CLIENT } from '~app/infra/redis/redis.constants';

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

  async ping(): Promise<string> {
    return this.redis.ping();
  }

  async get<T>(key: string): Promise<T | null> {
    try {
      const value = await this.redis.get(key);

      if (!value) {
        return null;
      }

      return JSON.parse(value) as T;
    } catch {
      return null;
    }
  }

  async set<T>(key: string, value: T, ttlSeconds?: number): Promise<void> {
    const serialized = JSON.stringify(value);

    if (ttlSeconds) {
      await this.redis.set(key, serialized, 'EX', ttlSeconds);
      return;
    }

    await this.redis.set(key, serialized);
  }

  async del(key: string) {
    return this.redis.del(key);
  }

  async lazyLoadCache<T>(params: {
    cacheKey: string;
    load: () => Promise<T>;
    opts?: { ttlSeconds?: number };
  }): Promise<T> {
    const cached = await this.get<T>(params.cacheKey);

    if (cached !== null) {
      return cached;
    }

    const result = await params.load();

    void this.set(params.cacheKey, result, params.opts?.ttlSeconds);

    return result;
  }
}
