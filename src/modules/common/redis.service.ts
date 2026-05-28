import { Inject, Injectable } from '@nestjs/common';
import Redis from 'ioredis';
import { CACHE_REDIS_CLIENT } from './redis.module';

@Injectable()
export class RedisService {
  constructor(
    @Inject(CACHE_REDIS_CLIENT)
    private readonly redis: Redis,
  ) {}

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
