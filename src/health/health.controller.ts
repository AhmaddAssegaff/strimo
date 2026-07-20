import { Controller, Get } from '@nestjs/common';
import {
  HealthCheckService,
  MemoryHealthIndicator,
  DiskHealthIndicator,
  HealthCheck,
  // HttpHealthIndicator,
} from '@nestjs/terminus';
import { RedisHealthIndicator } from './indicators/redis.health';
import { PostgresHealthIndicator } from './indicators/postgres.health';
import { MinioHealthIndicator } from './indicators/minio.health';
import { ConfigService } from '@nestjs/config';
import { CONSTANTS } from '~app/config';

// The built-in HttpHealthIndicator requires `@nestjs/axios`.
// Otherwise, implement your own HttpHealthIndicator.

@Controller('health')
export class HealthController {
  private readonly memoryHeapLimit: number;
  private readonly memoryRSSLimit: number;
  private readonly diskThreshold: number;

  constructor(
    private readonly config: ConfigService,
    private readonly health: HealthCheckService,
    private readonly memory: MemoryHealthIndicator,
    private readonly disk: DiskHealthIndicator,
    private readonly redis: RedisHealthIndicator,
    private readonly postgres: PostgresHealthIndicator,
    private readonly minio: MinioHealthIndicator,
  ) {
    this.memoryHeapLimit = this.config.getOrThrow(
      CONSTANTS.HEALTH.HEALTH_MEMORY_HEAP_LIMIT,
    );
    this.memoryRSSLimit = this.config.getOrThrow(
      CONSTANTS.HEALTH.HEALTH_MEMORY_RSS_LIMIT,
    );
    this.diskThreshold = this.config.getOrThrow(
      CONSTANTS.HEALTH.HEALTH_DISK_THRESHOLD,
    );
  }

  @Get('live')
  liveness() {
    return { status: 'ok' };
  }

  @Get('ready')
  @HealthCheck()
  readiness() {
    return this.health.check([
      () => this.redis.check('redis'),
      () => this.postgres.check('postgres'),
      () => this.minio.check('minio'),
      // () => this.http.pingCheck('external-api', 'https://google.com'),
    ]);
  }

  @Get()
  @HealthCheck()
  check() {
    return this.health.check([
      () => this.memory.checkHeap('memory_heap', this.memoryHeapLimit),
      () => this.memory.checkRSS('memory_rss', this.memoryRSSLimit),
      () =>
        this.disk.checkStorage('disk', {
          path: '/',
          thresholdPercent: this.diskThreshold,
        }),
    ]);
  }
}
