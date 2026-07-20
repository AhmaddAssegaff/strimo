import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from '../auth.controller';
import { AuthService } from '../auth.service';
import { MockAuthService, mockLoginResponse } from './auth.mock.test';
import { LoginDto } from '../dto/login.dto';
import { UnauthorizedException } from '@nestjs/common';

describe('AuthController', () => {
  let controller: AuthController;
  let mockAuthService: MockAuthService;

  beforeEach(async () => {
    mockAuthService = {
      login: jest.fn(),
      register: jest.fn(),
      refreshToken: jest.fn(),
      requestEmailVerification: jest.fn(),
      confirmEmailVerification: jest.fn(),
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

  describe('login', () => {
    it('should call authService.login with dto and only call authService.login', async () => {
      const dto: LoginDto = { email: 'email@gmail.com', password: 'password' };
      await controller.login(dto);

      expect(mockAuthService.login).toHaveBeenCalledWith(dto);
      expect(mockAuthService.login).toHaveBeenCalledTimes(1);

      expect(mockAuthService.register).not.toHaveBeenCalled();
      expect(mockAuthService.refreshToken).not.toHaveBeenCalled();
      expect(mockAuthService.requestEmailVerification).not.toHaveBeenCalled();
      expect(mockAuthService.confirmEmailVerification).not.toHaveBeenCalled();
    });

    it('should return access token and refresh token', async () => {
      const dto: LoginDto = { email: 'email@gmail.com', password: 'password' };
      const expectedResult: mockLoginResponse = {
        tokens: {
          accessToken: 'accessToken',
          refreshToken: 'refreshToken',
        },
      };

      mockAuthService.login.mockResolvedValue(expectedResult);
      const result = await controller.login(dto);

      expect(result).toEqual(expectedResult);
    });

    it('should throw UnauthorizedException', async () => {
      const dto: LoginDto = {
        email: 'email@gmail.com',
        password: 'password',
      };

      mockAuthService.login.mockRejectedValue(new UnauthorizedException());

      await expect(controller.login(dto)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });
});
