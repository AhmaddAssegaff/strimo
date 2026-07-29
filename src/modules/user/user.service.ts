import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '~app/core/prisma/prisma.service';
import {
  AuthenticatedUser,
  UserOauthGoogle,
} from '../auth/interface/auth.interface';
import { USER_ACCOUNTS_PROVIDER } from '@prisma/client';
import { ObjectStorageService } from '~app/core/object-storage/object-storage.service';
import { UpdateUserProfile } from './dto/update-user';
import {
  CreateUserOauthResult,
  FindUserCredensialByIdResult,
  UpdateUserProfileResult,
  UserProfileResult,
} from './interface/user.interface';
import { ProfilePictureProcessorService } from './profile-picture.proscessor.service';
import { PROFILE_PICTURE_BUCKET_NAME } from '~app/core/object-storage/object-storage.constants';

@Injectable()
export class UserService {
  constructor(
    private readonly s3Client: ObjectStorageService,
    private readonly prisma: PrismaService,
    private readonly photoProfile: ProfilePictureProcessorService,
  ) {}

  async findUserProfile(
    currentUser: AuthenticatedUser,
  ): Promise<UserProfileResult> {
    const user = await this.prisma.user.findUnique({
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

    if (!user) {
      throw new NotFoundException('user not found');
    }

    return user;
  }

  async findUserCredensialById(
    id: string,
  ): Promise<FindUserCredensialByIdResult | null> {
    return await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        isEmailVerified: true,
      },
    });
  }

  async createUserOauth(
    userData: UserOauthGoogle,
  ): Promise<CreateUserOauthResult> {
    return this.prisma.$transaction(async (tx) => {
      const user = await tx.user.upsert({
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

      const account = await tx.userAccount.findFirst({
        where: {
          userId: user.id,
          provider: USER_ACCOUNTS_PROVIDER.google,
        },
      });

      if (!account) {
        await tx.userAccount.create({
          data: {
            userId: user.id,
            provider: USER_ACCOUNTS_PROVIDER.google,
            providerId: userData.googleId,
          },
        });
      }

      return user;
    });
  }

  async updateUserProfile(
    updateUserProfile: UpdateUserProfile,
    currentUser: AuthenticatedUser,
  ): Promise<UpdateUserProfileResult> {
    const user = await this.prisma.user.update({
      where: {
        id: currentUser.sub,
      },
      data: {
        username: updateUserProfile.username,
      },
    });

    const presignedUrl = await this.s3Client.getFileUrl(
      PROFILE_PICTURE_BUCKET_NAME,
      user.profilePicture!,
    );

    return {
      ...user,
      profilePicture: presignedUrl,
    };
  }

  async updateUserProfilePicture(
    file: Express.Multer.File,
    currentUser: AuthenticatedUser,
  ): Promise<UpdateUserProfileResult> {
    const oldProfilePicture = await this.prisma.user.findUnique({
      where: {
        id: currentUser.sub,
      },
      select: {
        profilePicture: true,
      },
    });

    if (!oldProfilePicture) {
      throw new NotFoundException('Profile picture not found');
    }

    const resizedBuffer = await this.photoProfile.adjustAspectRatio(
      file.buffer,
    );
    const webpBuffer = await this.photoProfile.convertToWebp(resizedBuffer);
    const webpFile: Express.Multer.File = {
      ...file,
      buffer: webpBuffer,
      size: webpBuffer.length,
      mimetype: 'image/webp',
      originalname: 'profile.webp',
    };

    const objectName = currentUser.sub;
    await this.s3Client.uploadFile(
      PROFILE_PICTURE_BUCKET_NAME,
      objectName,
      webpFile,
    );
    const user = await this.prisma.user.update({
      where: {
        id: currentUser.sub,
      },
      data: {
        profilePicture: objectName,
      },
    });

    const presignedUrl = await this.s3Client.getFileUrl(
      PROFILE_PICTURE_BUCKET_NAME,
      objectName,
    );

    if (oldProfilePicture) {
      await this.s3Client.deleteFile(PROFILE_PICTURE_BUCKET_NAME, objectName);
    }

    return {
      ...user,
      profilePicture: presignedUrl,
    };
  }
}
