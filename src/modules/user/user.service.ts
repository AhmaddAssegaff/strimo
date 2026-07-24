import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '~app/core/prisma/prisma.service';
import sharp from 'sharp';
import { AuthenticatedUser, userOauthGoogle } from '../auth/auth.interface';
import { USER_ACCOUNTS_PROVIDER } from '@prisma/client';
import { MinioService } from '~app/core/minio/minio.service';
import { UpdateUserProfile } from './dto/update-user';
import { ConfigService } from '@nestjs/config';
import { CONSTANTS } from '~app/config';
import {
  CreateUserOauthResult,
  FindUserCredensialByIdResult,
  UpdateUserProfileResult,
  UserProfileResult,
} from './interface/user.interface';
import { FILE_RULES } from '~app/core/pipes/file-upload/file-upload.constant';

@Injectable()
export class UserService {
  private readonly userProfileBucketName: string;

  constructor(
    private readonly minio: MinioService,
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {
    this.userProfileBucketName = this.config.getOrThrow(
      CONSTANTS.BUCKETS_MINIO.MINIO_USER_PROFILE_BUCKET_NAME,
    );
  }

  private async adjustAspectRatio(buffer: Buffer): Promise<Buffer> {
    return sharp(buffer)
      .resize({
        width: FILE_RULES.profilePicture.minWidth,
        height: FILE_RULES.profilePicture.minHeight,
        fit: 'cover',
        position: 'centre',
      })
      .toBuffer();
  }

  private async covertToWebp(buffer: Buffer): Promise<Buffer> {
    return sharp(buffer)
      .webp({
        quality: 80,
      })
      .toBuffer();
  }

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
    userData: userOauthGoogle,
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

    return {
      ...user,
      profilePicture: await this.minio.getFileUrl(
        this.userProfileBucketName,
        user.profilePicture!,
      ),
    };
  }

  async updateUserProfilePicture(
    file: Express.Multer.File,
    currentUser: AuthenticatedUser,
  ): Promise<UpdateUserProfileResult> {
    const resizedBuffer = await this.adjustAspectRatio(file.buffer);
    const webpBuffer = await this.covertToWebp(resizedBuffer);

    const webpFile: Express.Multer.File = {
      ...file,
      buffer: webpBuffer,
      size: webpBuffer.length,
      mimetype: 'image/webp',
      originalname: 'profile.webp',
    };

    const objectName = `${currentUser.sub}/profile`;

    await this.minio.uploadFile(
      this.userProfileBucketName,
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

    return {
      ...user,
      profilePicture: await this.minio.getFileUrl(
        this.userProfileBucketName,
        objectName,
      ),
    };
  }
}
