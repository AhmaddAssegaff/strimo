/* eslint-disable @typescript-eslint/unbound-method */
import { createMock } from '@golevelup/ts-vitest';
import type { DeepMocked } from '@golevelup/ts-vitest';
import { beforeEach, describe, expect, it } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { HealthIndicatorService } from '@nestjs/terminus';
import { ObjectStorageHealthIndicator } from '~app/health/indicators/object-storage.health';
import { ObjectStorageService } from '~app/infra/object-storage/object-storage.service';

describe('ObjectStorageHealthIndicator', () => {
  let objectStorageHealthIndicator: ObjectStorageHealthIndicator;
  let health: DeepMocked<HealthIndicatorService>;
  let objectStorageService: DeepMocked<ObjectStorageService>;
  let indicator: ReturnType<HealthIndicatorService['check']>;

  beforeEach(async () => {
    health = createMock<HealthIndicatorService>();
    objectStorageService = createMock<ObjectStorageService>();
    indicator = createMock<ReturnType<HealthIndicatorService['check']>>();

    health.check.mockReturnValue(indicator);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ObjectStorageHealthIndicator,
        {
          provide: HealthIndicatorService,
          useValue: health,
        },
        {
          provide: ObjectStorageService,
          useValue: objectStorageService,
        },
      ],
    }).compile();

    objectStorageHealthIndicator = module.get(ObjectStorageHealthIndicator);
  });

  describe('check', () => {
    it('should return up when object storage is healthy', async () => {
      await objectStorageHealthIndicator.check('s3Client');

      expect(objectStorageService.ping).toHaveBeenCalledOnce();
      expect(health.check).toHaveBeenCalledWith('s3Client');
      expect(indicator.up).toHaveBeenCalled();
    });

    it('should return down when object storage is unhealthy', async () => {
      objectStorageService.ping.mockRejectedValueOnce(
        new Error('object-storage connection failed'),
      );

      await objectStorageHealthIndicator.check('s3Client');

      expect(objectStorageService.ping).toHaveBeenCalledOnce();

      expect(indicator.down).toHaveBeenCalledWith({
        message: 'object-storage connection failed',
      });
    });
  });
});
