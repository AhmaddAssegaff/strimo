import { ConfigService } from '@nestjs/config';
import { MinioService } from '~app/core/minio/minio.service';
import { UserService } from '../user.service';
import { PhotoProfileProcessorService } from '../image-processor.service';
import { CONSTANTS } from '~app/config';

export type MockUserService = jest.Mocked<
  Pick<
    UserService,
    'findUserProfile' | 'updateUserProfile' | 'updateUserProfilePicture'
  >
>;

export type MockConfigService = jest.Mocked<Pick<ConfigService, 'getOrThrow'>>;

export type MockMinioUserService = jest.Mocked<
  Pick<MinioService, 'uploadFile' | 'getFileUrl'>
>;

export type MockPrismaUserService = {
  $transaction: jest.Mock;
  user: {
    findUnique: jest.Mock;
    upsert: jest.Mock;
    update: jest.Mock;
  };
  userAccount: {
    findFirst: jest.Mock;
    create: jest.Mock;
  };
};

export type MockPhotoProfileProcessorService = jest.Mocked<
  Pick<PhotoProfileProcessorService, 'adjustAspectRatio' | 'convertToWebp'>
>;

export const MockConfigUserService = {
  [CONSTANTS.BUCKETS_MINIO.MINIO_USER_PROFILE_BUCKET_NAME]: 'bucket-name',
} as const;
