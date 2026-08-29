import { Injectable } from '@nestjs/common';
import {
  HealthIndicatorResult,
  HealthIndicatorService,
} from '@nestjs/terminus';
import { PrismaService } from '~app/infra/prisma/prisma.service';

@Injectable()
export class PostgresHealthIndicator {
  constructor(
    private health: HealthIndicatorService,
    private prisma: PrismaService,
  ) {}

  async check(key: string): Promise<HealthIndicatorResult> {
    const indicator = this.health.check(key);

    try {
      await this.prisma.ping();

      return indicator.up();
    } catch (error) {
      return indicator.down({
        message:
          error instanceof Error
            ? error.message
            : 'Unknown error Postgres health',
      });
    }
  }
}
