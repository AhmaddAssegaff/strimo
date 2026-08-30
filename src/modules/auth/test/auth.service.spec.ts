/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { AuthService } from '../auth.service';
import { UserService } from '~app/modules/user/user.service';
import { AvatarStorageService } from '~app/infra/object-storage/avatar-storage.service';
import { BannerStorageService } from '~app/infra/object-storage/banner-storage.service';
import {
  AuthenticatedUser,
  JwtAuthPayload,
  OauthGoogleResult,
  RefreshTokenResult,
  UserOauthGoogle,
} from '../interface/auth.interface';
import { CONSTANTS } from '~app/config';
import { CreateUserOauthResult } from '~app/modules/user/interface/user.interface';

describe('AuthService', () => {
  let authService: AuthService;
  let jwtService: DeepMocked<JwtService>;
  let userService: DeepMocked<UserService>;
  let avatar: DeepMocked<AvatarStorageService>;
  let banner: DeepMocked<BannerStorageService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: ConfigService,
          useValue: {
            getOrThrow: jest.fn((key: string) => {
              switch (key) {
                case CONSTANTS.AUTH.AUTH_JWT_ACCESS_TOKEN_SECRET:
                  return 'access-secret';
                case CONSTANTS.AUTH.AUTH_JWT_ACCESS_TOKEN_EXPIRES_IN:
                  return 3600;
                case CONSTANTS.AUTH.AUTH_JWT_REFRESH_TOKEN_SECRET:
                  return 'refresh-secret';
                case CONSTANTS.AUTH.AUTH_JWT_REFRESH_TOKEN_EXPIRES_IN:
                  return 86400;
              }
            }),
          },
        },
      ],
    })
      .useMocker(createMock)
      .compile();

    authService = module.get<AuthService>(AuthService);
    jwtService = module.get(JwtService);
    userService = module.get(UserService);
    avatar = module.get(AvatarStorageService);
    banner = module.get(BannerStorageService);
  });

  describe('googleOauth', () => {
    const userGoogle: UserOauthGoogle = {
      email: 'dev@example.com',
      googleId: 'google-123',
      name: 'Dev User',
      picture: 'https://example.com/photo.jpg',
    };

    const createdUser: CreateUserOauthResult = {
      id: '59c0d2a4-db55-4df7-8a62-0b0311dd8a8e',
      email: 'email@gmail.com',
      channel: {
        id: '8578910b-e045-4163-bedd-032015494250',
      },
    };

    const expectedPayload: JwtAuthPayload = {
      sub: createdUser.id,
      channelId: createdUser.channel.id,
      email: createdUser.email,
    };

    const expectedResult: OauthGoogleResult = {
      tokens: {
        accessToken: 'mocked-access-token',
        refreshToken: 'mocked-refresh-token',
      },
    };

    it('should create or find user oauth, sign both access and refresh tokens', async () => {
      banner.getDefaultKey.mockReturnValue('default-banner.png');
      avatar.getDefaultKey.mockReturnValue('default-avatar.png');
      userService.createUserOauth.mockResolvedValue(createdUser);

      jwtService.sign
        .mockReturnValueOnce(expectedResult.tokens.accessToken)
        .mockReturnValueOnce(expectedResult.tokens.refreshToken);

      const actualResult = await authService.googleOauth(userGoogle);

      expect(banner.getDefaultKey).toHaveBeenCalledTimes(1);
      expect(avatar.getDefaultKey).toHaveBeenCalledTimes(1);

      expect(userService.createUserOauth).toHaveBeenCalledTimes(1);
      expect(userService.createUserOauth).toHaveBeenCalledWith(
        userGoogle,
        'default-banner.png',
        'default-avatar.png',
      );

      expect(jwtService.sign).toHaveBeenCalledTimes(2);
      expect(jwtService.sign).toHaveBeenNthCalledWith(1, expectedPayload, {
        algorithm: 'HS256',
        secret: 'access-secret',
        expiresIn: 3600,
      });
      expect(jwtService.sign).toHaveBeenNthCalledWith(2, expectedPayload, {
        algorithm: 'HS256',
        secret: 'refresh-secret',
        expiresIn: 86400,
      });

      expect(actualResult).toEqual(expectedResult);
    });
  });

  describe('refreshToken', () => {
    const user: AuthenticatedUser = {
      sub: 'user-uuid-123',
      channelId: 'channel-uuid-456',
      email: 'dev@example.com',
    };

    const expectedPayload: JwtAuthPayload = {
      sub: user.sub,
      channelId: user.channelId,
      email: user.email,
    };

    const expectedResult: RefreshTokenResult = {
      token: {
        accessToken: 'accessToken',
      },
    };

    it('should generate a new access token', () => {
      jwtService.sign.mockReturnValue(expectedResult.token.accessToken);

      const actualResult = authService.refreshToken(user);

      expect(jwtService.sign).toHaveBeenCalledTimes(1);
      expect(jwtService.sign).toHaveBeenCalledWith(expectedPayload, {
        algorithm: 'HS256',
        secret: 'access-secret',
        expiresIn: 3600,
      });

      expect(actualResult).toEqual(expectedResult);
    });
  });
});
