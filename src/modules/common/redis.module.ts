import { Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import Redis from 'ioredis';
import { CONSTANTS } from '../../config';
import { RedisService } from './redis.service';

export const CACHE_REDIS_CLIENT = Symbol('CACHE_REDIS_CLIENT');

@Global()
@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: CACHE_REDIS_CLIENT,
      inject: [ConfigService],
      useFactory: (config: ConfigService) =>
        new Redis({
          host: config.getOrThrow<string>(CONSTANTS.REDIS.REDIS_HOST),
          port: config.getOrThrow<number>(CONSTANTS.REDIS.REDIS_PORT),
          password: config.getOrThrow<string>(CONSTANTS.REDIS.REDIS_PASSWORD),
          connectTimeout: config.getOrThrow<number>(
            CONSTANTS.REDIS.REDIS_CONNECT_TIMEOUT_MS,
          ),
          retryStrategy: (times: number) =>
            Math.min(
              times *
                config.getOrThrow<number>(
                  CONSTANTS.REDIS.REDIS_RECONNECT_MULTIPLIER,
                ),
              config.getOrThrow<number>(
                CONSTANTS.REDIS.REDIS_MAX_RECONNECT_DELAY_MS,
              ),
            ),

          maxRetriesPerRequest: 3,
          enableReadyCheck: true,
          lazyConnect: true,
        }),
    },
    RedisService,
  ],
  exports: [CACHE_REDIS_CLIENT, RedisService],
})
export class RedisModule {}
