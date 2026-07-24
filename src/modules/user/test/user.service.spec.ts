import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from '../user.service';
import { PrismaService } from '~app/core/prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import { AuthenticatedUser } from '~app/modules/auth/auth.interface';
import {
  MockConfigService,
  MockMinioUserService,
  MockPrismaUserService,
} from './user.mock.test';
import {
  createConfigServiceMock,
  createMockMinioService,
  createMockPrismaUserService,
} from './user.factory.test';
import { MinioService } from '~app/core/minio/minio.service';
import { NotFoundException } from '@nestjs/common';
import { UserProfileResult } from '../interface/user.interface';

describe('UserService', () => {
  let userService: UserService;

  let prisma: MockPrismaUserService;
  let config: MockConfigService;
  let minio: MockMinioUserService;

  beforeEach(async () => {
    prisma = createMockPrismaUserService();
    config = createConfigServiceMock();
    minio = createMockMinioService();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: PrismaService,
          useValue: prisma,
        },
        {
          provide: ConfigService,
          useValue: config,
        },
        {
          provide: MinioService,
          useValue: minio,
        },
      ],
    }).compile();

    userService = module.get<UserService>(UserService);
  });

  describe('findUserProfile', () => {
    const currentUser: AuthenticatedUser = {
      email: 'email@email.com',
      sub: 'cbbd290a-b336-4dbf-acb5-e034ba032e83',
    };

    const userProfileResult: UserProfileResult = {
      id: '21331845-59fc-4f4b-971b-7601f00df925',
      email: 'email@gmail.com',
      createdAt: new Date(),
      isEmailVerified: true,
      profilePicture: 'url',
      username: 'username',
    };

    it('should return user profile when user exists', async () => {
      prisma.user.findUnique.mockResolvedValue(userProfileResult);

      const usr = await userService.findUserProfile(currentUser);

      expect(prisma.user.findUnique).toHaveBeenCalledTimes(1);
      expect(usr).toBeDefined();
      expect(usr).toEqual(userProfileResult);
    });

    it('should throw NotFoundException when user does not exist', async () => {
      prisma.user.findUnique.mockResolvedValue(null);

      await expect(userService.findUserProfile(currentUser)).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
