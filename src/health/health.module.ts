import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';
import { HealthController } from './health.controller';
import { RedisHealthIndicator } from './indicators/redis.health';
import { PostgresHealthIndicator } from './indicators/postgres.health';
import { ObjectStorageHealthIndicator } from './indicators/object-storage.health';

@Module({
  imports: [TerminusModule],
  controllers: [HealthController],
  providers: [
    RedisHealthIndicator,
    PostgresHealthIndicator,
    ObjectStorageHealthIndicator,
  ],
})
export class HealthModule {}
