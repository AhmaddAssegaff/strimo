/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from '../auth.controller';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { AuthService } from '../auth.service';
import {
  AuthenticatedUser,
  OauthGoogleResult,
  RefreshTokenResult,
  UserOauthGoogle,
} from '../interface/auth.interface';

describe('AuthController', () => {
  let authController: AuthController;
  let authService: DeepMocked<AuthService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
    })
      .useMocker(createMock)
      .compile();

    authController = module.get<AuthController>(AuthController);
    authService = module.get(AuthService);
  });

  describe('googleOauthCallback', () => {
    const user: UserOauthGoogle = {
      email: 'email@gmail.com',
      googleId: 'googleId',
      name: 'name',
      picture: 'url profile pic',
    };

    const result: OauthGoogleResult = {
      tokens: {
        accessToken: 'accessToken',
        refreshToken: 'refreshToken',
      },
    };

    it('it should only call authService.googleOauth', async () => {
      authService.googleOauth.mockResolvedValue(result);

      const res = await authController.googleOauthCallback(user);

      expect(authService.googleOauth).toHaveBeenCalledWith(user);
      expect(authService.googleOauth).toHaveBeenCalledTimes(1);

      expect(res).toEqual(result);
    });
  });

  describe('refreshToken', () => {
    const user: AuthenticatedUser = {
      email: 'email@gmail.com',
      channelId: '9d0d0b15-fba9-4ed5-aa68-014954fa05cf',
      sub: '6a5d0b02-a24c-4c8e-bc21-b40b741ae455',
    };

    const result: RefreshTokenResult = {
      token: {
        accessToken: 'accessToken',
      },
    };

    it('it should only call authService.refreshToken', () => {
      authService.refreshToken.mockReturnValue(result);

      const res = authController.refreshToken(user);

      expect(authService.refreshToken).toHaveBeenCalledWith(user);
      expect(authService.refreshToken).toHaveBeenCalledTimes(1);

      expect(res).toEqual(result);
    });
  });
});
