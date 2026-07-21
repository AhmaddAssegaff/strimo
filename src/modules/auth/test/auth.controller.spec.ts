import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from '../auth.controller';
import { AuthService } from '../auth.service';
import { MockAuthServiceMethod } from './auth.mock.test';
import { JwtAuthPayload, userOauthGoogle } from '../auth.interface';

describe('AuthController', () => {
  let controller: AuthController;
  let mockAuthService: MockAuthServiceMethod;

  beforeEach(async () => {
    mockAuthService = {
      googleOauth: jest.fn(),
      refreshToken: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  describe('googleOauth', () => {
    it('should not throw', () => {
      expect(() => controller.googleOauth()).not.toThrow();
    });
  });

  describe('googleOauthCallback', () => {
    it('should call authService.googleOauth', () => {
      const user: userOauthGoogle = {
        email: 'email',
        googleId: 'googleId',
        name: 'username',
        picture: 'url profile pic',
      };

      controller.googleOauthCallback(user);

      expect(mockAuthService.googleOauth).toHaveBeenCalledTimes(1);
      expect(mockAuthService.googleOauth).toHaveBeenCalledWith(user);
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

      controller.refreshToken(user);

      expect(mockAuthService.refreshToken).toHaveBeenCalledTimes(1);
      expect(mockAuthService.refreshToken).toHaveBeenCalledWith(user);
    });
  });
});
