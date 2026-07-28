import {
  MockConfigService,
  MockMinioUserService,
  MockPrismaUserService,
  MockUserService,
  MockConfigUserService,
  MockPhotoProfileProcessorService,
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

export function createConfigServiceMock(): MockConfigService {
  const configMap: Record<string, any> = {
    ...MockConfigUserService,
  };

  const config: MockConfigService = {
    getOrThrow: jest.fn(),
  };

  config.getOrThrow.mockImplementation((key: string) => {
    if (key in configMap) {
      return configMap[key];
    }

    throw new Error(`Unexpected config key: ${key}`);
  });

  return config;
}

export function createMockMinioService(): MockMinioUserService {
  return {
    uploadFile: jest.fn(),
    getFileUrl: jest.fn(),
    deleteFile: jest.fn(),
  };
}

export function createMockPhotoProfileProcessorService(): MockPhotoProfileProcessorService {
  return {
    adjustAspectRatio: jest.fn(),
    convertToWebp: jest.fn(),
  };
}
