import { ConfigService } from '@nestjs/config';
import { MinioService } from '~app/core/minio/minio.service';
import { UserService } from '../user.service';
import { ProfilePictureProcessorService } from '../profile-picture.proscessor.service';
import { PROFILE_PICTURE_BUCKET_NAME } from '~core/minio/minio.constants';

export type MockUserService = jest.Mocked<
  Pick<
    UserService,
    'findUserProfile' | 'updateUserProfile' | 'updateUserProfilePicture'
  >
>;

export type MockConfigService = jest.Mocked<Pick<ConfigService, 'getOrThrow'>>;

export type MockMinioUserService = jest.Mocked<
  Pick<MinioService, 'uploadFile' | 'getFileUrl' | 'deleteFile'>
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
  Pick<ProfilePictureProcessorService, 'adjustAspectRatio' | 'convertToWebp'>
>;

export const MockConfigUserService = {
  [PROFILE_PICTURE_BUCKET_NAME]: 'bucket-name',
} as const;
