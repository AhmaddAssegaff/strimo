import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from '../auth.controller';
import { AuthService } from '../auth.service';
import { MockAuthService } from './auth.mock.test';
import { JwtAuthPayload, userOauthGoogle } from '../interface/auth.interface';
import { createAuthServiceMock } from './auth.factory.test';

describe('AuthController', () => {
  let authController: AuthController;
  let authService: MockAuthService;

  beforeEach(async () => {
    authService = createAuthServiceMock();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: authService,
        },
      ],
    }).compile();

    authController = module.get<AuthController>(AuthController);
  });

  describe('googleOauthCallback', () => {
    it('should call authService.googleOauth', () => {
      const user: userOauthGoogle = {
        email: 'email',
        googleId: 'googleId',
        name: 'username',
        picture: 'url profile pic',
      };

      authController.googleOauthCallback(user);

      expect(authService.googleOauth).toHaveBeenCalledTimes(1);
      expect(authService.googleOauth).toHaveBeenCalledWith(user);
    });
  });

  describe('refreshToken', () => {
    it('should call authService.refreshToken', () => {
      const user: JwtAuthPayload = {
        email: 'user@email.com',
        sub: '354d512d-c665-4d39-8b7a-dea81f05b801',
        exp: 123,
        iat: 123,
      };

      authController.refreshToken(user);

      expect(authService.refreshToken).toHaveBeenCalledTimes(1);
      expect(authService.refreshToken).toHaveBeenCalledWith(user);
    });
  });
});
