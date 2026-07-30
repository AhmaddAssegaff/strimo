import {
  MockPrismaUserService,
  MockProfilePictureStorageService,
  MockUserService,
} from './user.type.mock';

export function createMockUserService(): MockUserService {
  return {
    findUserProfile: jest.fn(),
    updateUserProfile: jest.fn(),
    updateUserProfilePicture: jest.fn(),
  };
}

export function createMockPrismaUserService(): MockPrismaUserService {
  const mock = {
    $transaction: jest.fn(),
    user: {
      findUnique: jest.fn(),
      upsert: jest.fn(),
      update: jest.fn(),
    },
    userAccount: {
      create: jest.fn(),
      findFirst: jest.fn(),
    },
  };

  mock.$transaction.mockImplementation(
    <T>(cb: (tx: typeof mock) => Promise<T> | T): Promise<T> | T => cb(mock),
  );

  return mock;
}

export function createMockProfilePictureStorageService(): MockProfilePictureStorageService {
  return {
    deleteProfilePicture: jest.fn(),
    getProfilePictureUrl: jest.fn(),
    processAndUpload: jest.fn(),
  };
}
