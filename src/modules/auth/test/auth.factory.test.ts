import {
  MockAuthService,
  MockUserService,
  MockConfigService,
  MockConfigAuthService,
  MockJwtService,
} from './auth.mock.test';

export function createAuthServiceMock(): MockAuthService {
  return {
    googleOauth: jest.fn(),
    refreshToken: jest.fn(),
  };
}

export function createUserServiceMoce(): MockUserService {
  return {
    createUserOauth: jest.fn(),
    findUserCredensialById: jest.fn(),
  };
}

export function createConfigServiceMock(): MockConfigService {
  const configMap: Record<string, any> = {
    ...MockConfigAuthService,
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

export function createJwtServiceMock(): MockJwtService {
  return {
    sign: jest.fn(),
  };
}
