import {
  MockConfigService,
  MockMinioUserService,
  MockPrismaUserService,
  MockUserService,
  MockConfigUserService,
} from './user.mock.test';

export function createMockUserService(): MockUserService {
  return {
    findUserProfile: jest.fn(),
    updateUserProfile: jest.fn(),
    updateUserProfilePicture: jest.fn(),
  };
}

export function createMockPrismaUserService(): MockPrismaUserService {
  return {
    user: {
      findUnique: jest.fn(),
    },
  };
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
  };
}
