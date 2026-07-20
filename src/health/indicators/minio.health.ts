import { Injectable } from '@nestjs/common';
import {
  HealthIndicatorResult,
  HealthIndicatorService,
} from '@nestjs/terminus';
import { MinioService } from '~app/core/minio/minio.service';

@Injectable()
export class MinioHealthIndicator {
  constructor(
    private health: HealthIndicatorService,
    private minio: MinioService,
  ) {}

  async check(key: string): Promise<HealthIndicatorResult> {
    const indicator = this.health.check(key);

    try {
      await this.minio.ping();

      return indicator.up();
    } catch (error) {
      return indicator.down({
        message:
          error instanceof Error ? error.message : 'Unknown error minio health',
      });
    }
  }
}
