/* eslint-disable @typescript-eslint/unbound-method */
import { createMock, type DeepMocked } from '@golevelup/ts-vitest';
import { beforeEach, describe, expect, it } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { HealthIndicatorService } from '@nestjs/terminus';
import { PostgresHealthIndicator } from '~app/health/indicators/postgres.health';
import { PrismaService } from '~app/infra/prisma/prisma.service';

describe('PostgresHealthIndicator', () => {
  let postgresHealthIndicator: PostgresHealthIndicator;
  let health: DeepMocked<HealthIndicatorService>;
  let prisma: DeepMocked<PrismaService>;

  beforeEach(async () => {
    health = createMock<HealthIndicatorService>();
    prisma = createMock<PrismaService>();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PostgresHealthIndicator,
        {
          provide: HealthIndicatorService,
          useValue: health,
        },
        {
          provide: PrismaService,
          useValue: prisma,
        },
      ],
    }).compile();

    postgresHealthIndicator = module.get(PostgresHealthIndicator);
  });

  describe('check', () => {
    it('should return up when postgres is healthy', async () => {
      await postgresHealthIndicator.check('postgres');

      expect(prisma.ping).toHaveBeenCalledOnce();
      expect(health.check).toHaveBeenCalledWith('postgres');
    });

    it('should return down when postgres is unhealthy', async () => {
      prisma.ping.mockRejectedValueOnce(
        new Error('Postgres connection failed'),
      );

      await postgresHealthIndicator.check('postgres');

      expect(prisma.ping).toHaveBeenCalledOnce();
    });
  });
});
