import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CONSTANTS } from '~config/index';

@Module({
  imports: [
    BullModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        connection: {
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
          maxRetriesPerRequest: null,
          enableReadyCheck: true,
          lazyConnect: true,
        },
      }),
    }),
  ],
  exports: [BullmqModule],
})
export class BullmqModule {}
