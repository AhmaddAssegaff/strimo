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
import { JwtAuthPayload, userOauthGoogle } from '../interface/auth.interface';
import {
  createConfigServiceMock,
  createJwtServiceMock,
  createUserServiceMoce,
} from './auth.factory.test';

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

  describe('AuthService config', () => {
    it('should load jwt config', () => {
      expect(config.getOrThrow).toHaveBeenCalledTimes(4);
    });
  });

  describe('googleOauth', () => {
    it('should call AuthService.createUserOauth and return tokens', async () => {
      const user: userOauthGoogle = {
        email: 'email',
        googleId: 'googleId',
        name: 'name',
        picture: 'profile picture',
      };

      userService.createUserOauth.mockResolvedValue({
        id: 'user-id',
        email: 'email',
      });

      jwt.sign
        .mockReturnValueOnce('access-token')
        .mockReturnValueOnce('refresh-token');

      await authService.googleOauth(user);

      expect(userService.createUserOauth).toHaveBeenCalledTimes(1);
      expect(userService.createUserOauth).toHaveBeenCalledWith(user);

      expect(jwt.sign).toHaveBeenCalledTimes(2);
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

      userService.findUserCredensialById.mockResolvedValue({
        email: 'email',
        id: 'f57623d6-051e-4657-b8bd-9ac210fdbd7e',
        isEmailVerified: true,
      });
      jwt.sign.mockReturnValueOnce('access-token');

      await authService.refreshToken(user);

      expect(userService.findUserCredensialById).toHaveBeenCalledTimes(1);
      expect(userService.findUserCredensialById).toHaveBeenCalledWith(user.sub);
      expect(jwt.sign).toHaveBeenCalledTimes(1);
    });
  });
});
