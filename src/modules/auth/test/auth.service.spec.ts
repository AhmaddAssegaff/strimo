import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from '../auth.service';
import {
  MockConfigService,
  MockUserService,
  MockJwtService,
  MockConfigAuthString,
} from './auth.mock.test';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '~app/modules/user/user.service';
import { JwtAuthPayload, userOauthGoogle } from '../auth.interface';

describe('AuthService', () => {
  let service: AuthService;

  let mockConfigService: MockConfigService;
  let mockJwtService: MockJwtService;
  let mockUserService: MockUserService;

  beforeEach(async () => {
    mockConfigService = {
      getOrThrow: jest.fn(),
    };
    mockJwtService = {
      sign: jest.fn(),
    };
    mockUserService = {
      createUserOauth: jest.fn(),
      findUserCredensialById: jest.fn(),
    };

    mockConfigService.getOrThrow.mockImplementation((key) => {
      const value =
        MockConfigAuthString[key as keyof typeof MockConfigAuthString];

      if (value === undefined) {
        throw new Error(`Unexpected key: ${String(key)}`);
      }

      return value;
    });

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
        {
          provide: UserService,
          useValue: mockUserService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  describe('AuthService config', () => {
    it('should load jwt config', () => {
      expect(mockConfigService.getOrThrow).toHaveBeenCalledTimes(4);
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

      mockUserService.createUserOauth.mockResolvedValue({
        id: 'user-id',
        email: 'email',
      });

      mockJwtService.sign
        .mockReturnValueOnce('access-token')
        .mockReturnValueOnce('refresh-token');

      await service.googleOauth(user);

      expect(mockUserService.createUserOauth).toHaveBeenCalledTimes(1);
      expect(mockUserService.createUserOauth).toHaveBeenCalledWith(user);

      expect(mockJwtService.sign).toHaveBeenCalledTimes(2);
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

      mockUserService.findUserCredensialById.mockResolvedValue({
        email: 'email',
        id: 'f57623d6-051e-4657-b8bd-9ac210fdbd7e',
        isEmailVerified: true,
      });
      mockJwtService.sign.mockReturnValueOnce('access-token');

      await service.refreshToken(user);

      expect(mockUserService.findUserCredensialById).toHaveBeenCalledTimes(1);
      expect(mockUserService.findUserCredensialById).toHaveBeenCalledWith(
        user.sub,
      );
      expect(mockJwtService.sign).toHaveBeenCalledTimes(1);
    });
  });
});
