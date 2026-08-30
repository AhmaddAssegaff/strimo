import { Injectable } from '@nestjs/common';
import {
  HealthIndicatorService,
  HealthIndicatorResult,
} from '@nestjs/terminus';
import { RedisService } from '~app/infra/redis/redis.service';

@Injectable()
export class RedisHealthIndicator {
  constructor(
    private readonly health: HealthIndicatorService,
    private readonly redisService: RedisService,
  ) {}

  async check(key: string): Promise<HealthIndicatorResult> {
    const indicator = this.health.check(key);

    try {
      await this.redisService.ping();

      return indicator.up();
    } catch (error) {
      return indicator.down({
        message:
          error instanceof Error ? error.message : 'Unknown error Redis Health',
      });
    }
  }
}
