import { Test, TestingModule } from '@nestjs/testing';
import { HealthIndicatorService } from '@nestjs/terminus';
import { ObjectStorageHealthIndicator } from '~app/health/indicators/object-storage.health';
import { ObjectStorageService } from '~app/core/object-storage/object-storage.service';
import {
  MockHealthIndicatorService,
  MockObjectStorageService,
} from '../health.type.mock';
import {
  createMockHealthIndicatorService,
  createMockObjectStorageService,
} from '../health.factory.mock';

describe('ObjectStorageHealthIndicator', () => {
  let objectStorageHealthIndicator: ObjectStorageHealthIndicator;
  let health: MockHealthIndicatorService;
  let s3Client: MockObjectStorageService;

  beforeEach(async () => {
    health = createMockHealthIndicatorService();
    s3Client = createMockObjectStorageService();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ObjectStorageHealthIndicator,
        {
          provide: HealthIndicatorService,
          useValue: health,
        },
        {
          provide: ObjectStorageService,
          useValue: s3Client,
        },
      ],
    }).compile();

    objectStorageHealthIndicator = module.get<ObjectStorageHealthIndicator>(
      ObjectStorageHealthIndicator,
    );
  });

  describe('check', () => {
    it('should return up when s3Client is healthy', async () => {
      await objectStorageHealthIndicator.check('s3Client');

      expect(s3Client.ping).toHaveBeenCalled();
      expect(health.indicator.up).toHaveBeenCalled();
    });

    it('should return down when object-storage is unhealthy', async () => {
      s3Client.ping.mockRejectedValueOnce(
        new Error('object-storage connection failed'),
      );

      await objectStorageHealthIndicator.check('s3Client');

      expect(s3Client.ping).toHaveBeenCalled();
      expect(health.indicator.down).toHaveBeenCalledWith({
        message: 'object-storage connection failed',
      });
    });
  });
});
