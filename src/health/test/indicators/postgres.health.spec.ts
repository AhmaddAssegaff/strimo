import { Test, TestingModule } from '@nestjs/testing';
import { HealthIndicatorService } from '@nestjs/terminus';
import { PostgresHealthIndicator } from '~app/health/indicators/postgres.health';
import { PrismaService } from '~app/infra/prisma/prisma.service';
import {
  MockHealthIndicatorService,
  MockPrismaService,
} from '../health.type.mock';
import {
  createMockHealthIndicatorService,
  createMockPrismaService,
} from '../health.factory.mock';

describe('PostgresHealthIndicator', () => {
  let postgresHealthIndicator: PostgresHealthIndicator;
  let health: MockHealthIndicatorService;
  let prisma: MockPrismaService;

  beforeEach(async () => {
    health = createMockHealthIndicatorService();
    prisma = createMockPrismaService();

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

    postgresHealthIndicator = module.get<PostgresHealthIndicator>(
      PostgresHealthIndicator,
    );
  });

  describe('check', () => {
    it('should return up when postgres is healthy', async () => {
      await postgresHealthIndicator.check('postgres');

      expect(prisma.ping).toHaveBeenCalled();
      expect(health.indicator.up).toHaveBeenCalled();
    });

    it('should return down when postgres is unhealthy', async () => {
      prisma.ping.mockRejectedValueOnce(
        new Error('Postgres connection failed'),
      );

      await postgresHealthIndicator.check('postgres');

      expect(prisma.ping).toHaveBeenCalled();
      expect(health.indicator.down).toHaveBeenCalledWith({
        message: 'Postgres connection failed',
      });
    });
  });
});
