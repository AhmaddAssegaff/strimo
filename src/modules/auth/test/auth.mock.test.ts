import { ConfigService } from '@nestjs/config';
import { AuthService } from '../auth.service';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '~app/modules/user/user.service';
import { CONSTANTS } from '~app/config';

export type MockAuthService = jest.Mocked<
  Pick<AuthService, 'googleOauth' | 'refreshToken'>
>;

export type MockConfigService = jest.Mocked<Pick<ConfigService, 'getOrThrow'>>;

export type MockJwtService = jest.Mocked<Pick<JwtService, 'sign'>>;

export type MockUserService = jest.Mocked<
  Pick<UserService, 'createUserOauth' | 'findUserCredensialById'>
>;

export const MockConfigAuthString = {
  [CONSTANTS.AUTH.AUTH_JWT_ACCESS_TOKEN_SECRET]: 'access-secret',
  [CONSTANTS.AUTH.AUTH_JWT_ACCESS_TOKEN_EXPIRES_IN]: 900,
  [CONSTANTS.AUTH.AUTH_JWT_REFRESH_TOKEN_SECRET]: 'refresh-secret',
  [CONSTANTS.AUTH.AUTH_JWT_REFRESH_TOKEN_EXPIRES_IN]: 604800,
} as const;
