import { ConfigService } from '@nestjs/config';
import { MinioService } from '~app/core/minio/minio.service';
import { UserService } from '../user.service';
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
  user: {
    findUnique: jest.Mock;
  };
};

export const MockConfigUserService = {
  [CONSTANTS.BUCKETS_MINIO.MINIO_USER_PROFILE_BUCKET_NAME]: 'bucket-name',
} as const;
