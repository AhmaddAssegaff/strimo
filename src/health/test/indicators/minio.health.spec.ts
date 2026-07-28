import { Test, TestingModule } from '@nestjs/testing';
import { HealthIndicatorService } from '@nestjs/terminus';
import { MinioHealthIndicator } from '~app/health/indicators/minio.health';
import { MinioService } from '~app/core/minio/minio.service';
import {
  MockHealthIndicatorService,
  MockMinioService,
} from '../health.type.mock';
import {
  createMockHealthIndicatorService,
  createMockMinioService,
} from '../health.factory.mock';

describe('MinioHealthIndicator', () => {
  let minioHealthIndicator: MinioHealthIndicator;
  let health: MockHealthIndicatorService;
  let minio: MockMinioService;

  beforeEach(async () => {
    health = createMockHealthIndicatorService();
    minio = createMockMinioService();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MinioHealthIndicator,
        {
          provide: HealthIndicatorService,
          useValue: health,
        },
        {
          provide: MinioService,
          useValue: minio,
        },
      ],
    }).compile();

    minioHealthIndicator =
      module.get<MinioHealthIndicator>(MinioHealthIndicator);
  });

  describe('check', () => {
    it('should return up when minio is healthy', async () => {
      await minioHealthIndicator.check('minio');

      expect(minio.ping).toHaveBeenCalled();
      expect(health.indicator.up).toHaveBeenCalled();
    });

    it('should return down when minio is unhealthy', async () => {
      minio.ping.mockRejectedValueOnce(new Error('Minio connection failed'));

      await minioHealthIndicator.check('minio');

      expect(minio.ping).toHaveBeenCalled();
      expect(health.indicator.down).toHaveBeenCalledWith({
        message: 'Minio connection failed',
      });
    });
  });
});
