import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';
import { HealthController } from './health.controller';
import { RedisModule } from '~app/core/redis/redis.module';
import { RedisHealthIndicator } from './indicators/redis.health';
import { PostgresHealthIndicator } from './indicators/postgres.health';
import { ObjectStorageHealthIndicator } from './indicators/object-storage.health';

@Module({
  imports: [TerminusModule, RedisModule],
  controllers: [HealthController],
  providers: [
    RedisHealthIndicator,
    PostgresHealthIndicator,
    ObjectStorageHealthIndicator,
  ],
})
export class HealthModule {}
