import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from '../user.service';
import { PrismaService } from '~app/core/prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import {
  AuthenticatedUser,
  UserOauthGoogle,
} from '~app/modules/auth/interface/auth.interface';
import {
  MockConfigService,
  MockMinioUserService,
  MockPhotoProfileProcessorService,
  MockPrismaUserService,
} from './user.mock.test';
import {
  createConfigServiceMock,
  createMockMinioService,
  createMockPhotoProfileProcessorService,
  createMockPrismaUserService,
} from './user.factory.test';
import { MinioService } from '~app/core/minio/minio.service';
import { NotFoundException } from '@nestjs/common';
import {
  CreateUserOauthResult,
  FindUserCredensialByIdResult,
  UpdateUserProfileResult,
  UserProfileResult,
} from '../interface/user.interface';
import { UpdateUserProfile } from '../dto/update-user';
import { ProfilePictureProcessorService } from '../profile-picture.proscessor.service';

describe('UserService', () => {
  let userService: UserService;

  let prisma: MockPrismaUserService;
  let config: MockConfigService;
  let minio: MockMinioUserService;
  let photo: MockPhotoProfileProcessorService;

  beforeEach(async () => {
    prisma = createMockPrismaUserService();
    config = createConfigServiceMock();
    minio = createMockMinioService();
    photo = createMockPhotoProfileProcessorService();

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
        {
          provide: ProfilePictureProcessorService,
          useValue: photo,
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

  describe('findUserCredensialById', () => {
    it('should only call prisma.user.findUnique', async () => {
      const findUserCredensialByIdResult: FindUserCredensialByIdResult = {
        email: 'email@gmail.com',
        id: '5232b226-1939-48ec-9c2d-5594b399a58a',
        isEmailVerified: true,
      };
      prisma.user.findUnique.mockResolvedValue(findUserCredensialByIdResult);

      const id = '601b714e-cc48-470a-aa77-3b8121f0fb9a';

      const user = await userService.findUserCredensialById(id);

      expect(prisma.user.findUnique).toHaveBeenCalledTimes(1);
      expect(user).toBeDefined();
      expect(user).toEqual(findUserCredensialByIdResult);
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

      expect(result).toBeDefined();
      expect(result).toEqual(createUserOauthResult);
    });

    it('should create userAccount when account does not exist', async () => {
      prisma.user.upsert.mockResolvedValue(createUserOauthResult);
      prisma.userAccount.findFirst.mockResolvedValue(null);

      await userService.createUserOauth(userData);

      expect(prisma.userAccount.create).toHaveBeenCalledTimes(1);
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

    const updateUserProfileResult: UpdateUserProfileResult = {
      id: 'c5cc2f28-5130-47e7-9870-8ea0f6c5a811',
      email: 'email@gmail.com',
      username: 'username',
      isEmailVerified: true,
      profilePicture: `${currentUser.sub}/profile.webp`,
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
    };

    const mockPresignedUrl =
      'https://minio.example.com/bucket/user-id/profile.webp';

    it('should update user profile and return profile with presigned picture URL', async () => {
      minio.getFileUrl.mockResolvedValue(mockPresignedUrl);
      prisma.user.update.mockResolvedValue(updateUserProfileResult);

      const result = await userService.updateUserProfile(dto, currentUser);

      expect(prisma.user.update).toHaveBeenCalledTimes(1);
      expect(minio.getFileUrl).toHaveBeenCalledTimes(1);
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
    const updateUserProfileResult: UpdateUserProfileResult = {
      id: 'af42ec08-81fc-42f0-893c-09e06a5b0b40',
      email: 'email@gmail.com',
      username: 'username',
      profilePicture: `${currentUser.sub}/profile`,
      isEmailVerified: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
    };
    const mockPresignedUrl =
      'https://minio.example.com/bucket/user-id/profile.webp';

    it('should process image, upload to MinIO, update DB, and return presigned URL', async () => {
      prisma.user.findUnique.mockResolvedValue({
        profilePicture: `${currentUser.sub}/old-profile.webp`,
      });

      photo.adjustAspectRatio.mockResolvedValue(Buffer.from('resized-buffer'));

      photo.convertToWebp.mockResolvedValue(Buffer.from('webp-buffer'));

      minio.getFileUrl.mockResolvedValue(mockPresignedUrl);
      prisma.user.update.mockResolvedValue(updateUserProfileResult);

      const result = await userService.updateUserProfilePicture(
        file,
        currentUser,
      );

      expect(photo.adjustAspectRatio).toHaveBeenCalledTimes(1);
      expect(photo.convertToWebp).toHaveBeenCalledTimes(1);
      expect(minio.uploadFile).toHaveBeenCalledTimes(1);
      expect(prisma.user.update).toHaveBeenCalledTimes(1);
      expect(minio.getFileUrl).toHaveBeenCalledTimes(1);
      expect(minio.deleteFile).toHaveBeenCalledTimes(1);

      expect(result).toEqual({
        ...updateUserProfileResult,
        profilePicture: mockPresignedUrl,
      });
    });

    it('should throw NotFoundException when oldProfilePicture is null', () => {
      prisma.user.findUnique.mockResolvedValue(null);

      expect(
        userService.updateUserProfilePicture(file, currentUser),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
