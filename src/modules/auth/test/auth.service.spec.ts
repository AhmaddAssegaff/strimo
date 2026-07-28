import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from '../auth.service';
import {
  MockConfigService,
  MockUserService,
  MockJwtService,
} from './auth.mock.test';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '~app/modules/user/user.service';
import {
  JwtAuthPayload,
  OauthGoogleResult,
  RefreshTokenResult,
  UserOauthGoogle,
} from '../interface/auth.interface';
import {
  createConfigServiceMock,
  createJwtServiceMock,
  createUserServiceMoce,
} from './auth.factory.test';
import { NotFoundException } from '@nestjs/common';

describe('AuthService', () => {
  let authService: AuthService;

  let config: MockConfigService;
  let jwt: MockJwtService;
  let userService: MockUserService;

  beforeEach(async () => {
    config = createConfigServiceMock();
    jwt = createJwtServiceMock();
    userService = createUserServiceMoce();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: ConfigService,
          useValue: config,
        },
        {
          provide: JwtService,
          useValue: jwt,
        },
        {
          provide: UserService,
          useValue: userService,
        },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
  });

  describe('googleOauth', () => {
    it('should call AuthService.createUserOauth and return tokens', async () => {
      const user: UserOauthGoogle = {
        email: 'email',
        googleId: 'googleId',
        name: 'name',
        picture: 'profile picture',
      };
      const oauthGoogleResponseInterface: OauthGoogleResult = {
        OauthGoogleResponseInterface: {
          accessToken: 'access-token',
          refreshToken: 'refresh-token',
        },
      };

      userService.createUserOauth.mockResolvedValue({
        id: 'user-id',
        email: 'email',
      });

      jwt.sign
        .mockReturnValueOnce('access-token')
        .mockReturnValueOnce('refresh-token');

      const userOauthGoogle = await authService.googleOauth(user);

      expect(userService.createUserOauth).toHaveBeenCalledTimes(1);
      expect(userService.createUserOauth).toHaveBeenCalledWith(user);

      expect(jwt.sign).toHaveBeenCalledTimes(2);

      expect(userOauthGoogle).toEqual(oauthGoogleResponseInterface);
    });
  });

  describe('refreshToken', () => {
    it('should call UserService.findUserCredensialById', async () => {
      const user: JwtAuthPayload = {
        email: 'email',
        sub: '675d028d-5b7d-4370-ba7b-615f10cad8e9',
        exp: 123,
        iat: 123,
      };
      const refreshResponseInterface: RefreshTokenResult = {
        token: {
          accessToken: 'access-token',
        },
      };

      userService.findUserCredensialById.mockResolvedValue({
        email: 'email',
        id: 'f57623d6-051e-4657-b8bd-9ac210fdbd7e',
        isEmailVerified: true,
      });
      jwt.sign.mockReturnValueOnce('access-token');

      const newAccesToken = await authService.refreshToken(user);

      expect(userService.findUserCredensialById).toHaveBeenCalledTimes(1);
      expect(userService.findUserCredensialById).toHaveBeenCalledWith(user.sub);
      expect(jwt.sign).toHaveBeenCalledTimes(1);

      expect(newAccesToken).toEqual(refreshResponseInterface);
    });

    it('should throw NotFoundException when user is null', async () => {
      userService.findUserCredensialById.mockResolvedValue(null);

      await expect(
        authService.refreshToken({
          email: 'email',
          sub: '675d028d-5b7d-4370-ba7b-615f10cad8e9',
          exp: 123,
          iat: 123,
        }),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
