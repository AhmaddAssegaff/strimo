import { Injectable } from '@nestjs/common';
import {
  HealthIndicatorResult,
  HealthIndicatorService,
} from '@nestjs/terminus';
import { ObjectStorageService } from '~app/core/object-storage/object-storage.service';

@Injectable()
export class ObjectStorageHealthIndicator {
  constructor(
    private health: HealthIndicatorService,
    private s3Client: ObjectStorageService,
  ) {}

  async check(key: string): Promise<HealthIndicatorResult> {
    const indicator = this.health.check(key);

    try {
      await this.s3Client.ping();

      return indicator.up();
    } catch (error) {
      return indicator.down({
        message:
          error instanceof Error
            ? error.message
            : 'Unknown error object-storage health',
      });
    }
  }
}
