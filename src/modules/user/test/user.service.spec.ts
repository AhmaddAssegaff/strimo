import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from '../user.service';
import { PrismaService } from '~app/core/prisma/prisma.service';
import {
  AuthenticatedUser,
  UserOauthGoogle,
} from '~app/modules/auth/interface/auth.interface';
import {
  MockPrismaUserService,
  MockProfilePictureStorageService,
} from './user.type.mock';
import {
  createMockPrismaUserService,
  createMockProfilePictureStorageService,
} from './user.factory.mock';
import { NotFoundException } from '@nestjs/common';
import {
  CreateUserOauthResult,
  FindUserCredensialByIdResult,
  UpdateUserProfileResult,
  UserProfileResult,
} from '../interface/user.interface';
import { UpdateUserProfile } from '../dto/update-user';
import { ProfilePictureStorageService } from '~app/core/object-storage/profile-picture-storage.service';
import { USER_ACCOUNTS_PROVIDER } from '@prisma/client';

describe('UserService', () => {
  let userService: UserService;
  let prisma: MockPrismaUserService;
  let profilePictureStorage: MockProfilePictureStorageService;

  beforeEach(async () => {
    prisma = createMockPrismaUserService();
    profilePictureStorage = createMockProfilePictureStorageService();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: PrismaService,
          useValue: prisma,
        },
        {
          provide: ProfilePictureStorageService,
          useValue: profilePictureStorage,
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
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: {
          id: currentUser.sub,
        },
        select: {
          id: true,
          email: true,
          username: true,
          profilePicture: true,
          isEmailVerified: true,
          createdAt: true,
        },
      });
      expect(usr).toBeDefined();
      expect(usr).toEqual(userProfileResult);
    });

    it('should throw NotFoundException when user does not exist', async () => {
      prisma.user.findUnique.mockResolvedValue(null);

      await expect(userService.findUserProfile(currentUser)).rejects.toThrow(
        NotFoundException,
      );

      expect(prisma.user.findUnique).toHaveBeenCalledTimes(1);
    });
  });

  describe('findUserCredensialById', () => {
    const findUserCredensialByIdResult: FindUserCredensialByIdResult = {
      email: 'email@gmail.com',
      id: '5232b226-1939-48ec-9c2d-5594b399a58a',
      isEmailVerified: true,
    };
    const id = '601b714e-cc48-470a-aa77-3b8121f0fb9a';

    it('should only call prisma.user.findUnique', async () => {
      prisma.user.findUnique.mockResolvedValue(findUserCredensialByIdResult);

      const user = await userService.findUserCredensialById(id);

      expect(prisma.user.findUnique).toHaveBeenCalledTimes(1);
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { id },
        select: {
          id: true,
          email: true,
          isEmailVerified: true,
        },
      });
      expect(user).toBeDefined();
      expect(user).toEqual(findUserCredensialByIdResult);
    });

    it('should return null when user does not exist', async () => {
      prisma.user.findUnique.mockResolvedValue(null);

      const result = await userService.findUserCredensialById(id);

      expect(prisma.user.findUnique).toHaveBeenCalledTimes(1);
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: {
          id,
        },
        select: {
          id: true,
          email: true,
          isEmailVerified: true,
        },
      });

      expect(result).toBeNull();
    });
  });

  describe('createUserOauth', () => {
    const userData: UserOauthGoogle = {
      email: 'email@gmail.com',
      googleId: 'googleId',
      name: 'name',
      picture: 'url',
    };

    const createUserOauthResult: CreateUserOauthResult = {
      email: 'email@gmail.com',
      id: '4bfe6e7f-f4aa-49da-b3a0-f393431b5d08',
    };

    it('should upsert user and skip account creation if user account already exists', async () => {
      prisma.user.upsert.mockResolvedValue(createUserOauthResult);
      prisma.userAccount.findFirst.mockResolvedValue({ id: 'account-123' });

      const result = await userService.createUserOauth(userData);

      expect(prisma.$transaction).toHaveBeenCalledTimes(1);
      expect(prisma.user.upsert).toHaveBeenCalledTimes(1);
      expect(prisma.user.upsert).toHaveBeenCalledWith({
        where: {
          email: userData.email,
        },
        create: {
          email: userData.email,
          username: userData.name,
          profilePicture: userData.picture,
          isEmailVerified: true,
        },
        update: {},
        select: {
          id: true,
          email: true,
        },
      });

      expect(prisma.userAccount.findFirst).toHaveBeenCalledTimes(1);
      expect(prisma.userAccount.findFirst).toHaveBeenCalledWith({
        where: {
          userId: createUserOauthResult.id,
          provider: USER_ACCOUNTS_PROVIDER.google,
        },
      });

      expect(result).toBeDefined();
      expect(result).toEqual(createUserOauthResult);
    });

    it('should create user account when account does not exist', async () => {
      prisma.user.upsert.mockResolvedValue(createUserOauthResult);
      prisma.userAccount.findFirst.mockResolvedValue(null);

      const result = await userService.createUserOauth(userData);

      expect(prisma.userAccount.create).toHaveBeenCalledTimes(1);
      expect(prisma.userAccount.create).toHaveBeenCalledWith({
        data: {
          userId: createUserOauthResult.id,
          provider: USER_ACCOUNTS_PROVIDER.google,
          providerId: userData.googleId,
        },
      });

      expect(result).toEqual(createUserOauthResult);
    });
  });

  describe('updateUserProfile', () => {
    const dto: UpdateUserProfile = {
      username: 'new username',
    };

    const currentUser: AuthenticatedUser = {
      email: 'email@gmail.com',
      sub: '4b1d29fe-89e7-48fa-9095-28a08ee3a1d7',
    };

    const mockPresignedUrl =
      'https://s3.example.com/bucket/user-id/profile.webp';

    const updateUserProfileResult: UpdateUserProfileResult = {
      id: 'c5cc2f28-5130-47e7-9870-8ea0f6c5a811',
      email: 'email@gmail.com',
      username: 'username',
      isEmailVerified: true,
      profilePicture: mockPresignedUrl,
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
    };

    it('should update user profile and return profile with presigned picture URL', async () => {
      profilePictureStorage.getProfilePictureUrl.mockResolvedValue(
        mockPresignedUrl,
      );
      prisma.user.update.mockResolvedValue(updateUserProfileResult);

      const result = await userService.updateUserProfile(dto, currentUser);

      expect(prisma.user.update).toHaveBeenCalledTimes(1);
      expect(prisma.user.update).toHaveBeenCalledWith({
        where: {
          id: currentUser.sub,
        },
        data: {
          username: dto.username,
        },
      });
      expect(result).toBeDefined();
      expect(result).toEqual({
        ...updateUserProfileResult,
        profilePicture: mockPresignedUrl,
      });
    });
  });

  describe('updateUserProfilePicture', () => {
    const file = {} as Express.Multer.File;
    const currentUser: AuthenticatedUser = {
      email: 'email@gmail.com',
      sub: '5e662bbc-50fc-421e-9665-22f6d2a55d4d',
    };

    const newProfilePicture = `${currentUser.sub}/profile.webp`;

    const mockPresignedUrl =
      'https://s3.example.com/bucket/user-id/profile.webp';

    const updateUserProfileResult: UpdateUserProfileResult = {
      id: 'af42ec08-81fc-42f0-893c-09e06a5b0b40',
      email: 'email@gmail.com',
      username: 'new username',
      profilePicture: newProfilePicture,
      isEmailVerified: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
    };

    const dto: UpdateUserProfile = {
      username: 'new username',
    };

    it('should update user profile and return profile with presigned picture URL', async () => {
      profilePictureStorage.getProfilePictureUrl.mockResolvedValue(
        mockPresignedUrl,
      );

      prisma.user.update.mockResolvedValue(updateUserProfileResult);

      const result = await userService.updateUserProfile(dto, currentUser);

      expect(prisma.user.update).toHaveBeenCalledTimes(1);
      expect(prisma.user.update).toHaveBeenCalledWith({
        where: {
          id: currentUser.sub,
        },
        data: {
          username: dto.username,
        },
      });

      expect(profilePictureStorage.getProfilePictureUrl).toHaveBeenCalledTimes(
        1,
      );

      expect(profilePictureStorage.getProfilePictureUrl).toHaveBeenCalledWith(
        updateUserProfileResult.profilePicture,
      );

      expect(result).toEqual({
        ...updateUserProfileResult,
        profilePicture: mockPresignedUrl,
      });
    });
    it('should throw NotFoundException when user does not exist', async () => {
      prisma.user.findUnique.mockResolvedValue(null);

      await expect(
        userService.updateUserProfilePicture(file, currentUser),
      ).rejects.toThrow(NotFoundException);

      expect(profilePictureStorage.processAndUpload).not.toHaveBeenCalled();

      expect(prisma.user.update).not.toHaveBeenCalled();

      expect(profilePictureStorage.deleteProfilePicture).not.toHaveBeenCalled();
    });
  });
});
