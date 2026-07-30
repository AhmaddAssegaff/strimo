import { UserService } from '../user.service';
import { ProfilePictureStorageService } from '~core/object-storage/profile-picture-storage.service';

export type MockUserService = jest.Mocked<
  Pick<
    UserService,
    'findUserProfile' | 'updateUserProfile' | 'updateUserProfilePicture'
  >
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

export type MockProfilePictureStorageService = jest.Mocked<
  Pick<
    ProfilePictureStorageService,
    'processAndUpload' | 'getProfilePictureUrl' | 'deleteProfilePicture'
  >
>;
