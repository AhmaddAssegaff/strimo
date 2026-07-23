import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '~app/core/prisma/prisma.service';
import { AuthenticatedUser, userOauthGoogle } from '../auth/auth.interface';
import { USER_ACCOUNTS_PROVIDER } from '@prisma/client';
import { MinioService } from '~app/core/minio/minio.service';
import { UpdateUserProfile } from './dto/update-user';
import { ConfigService } from '@nestjs/config';
import { CONSTANTS } from '~app/config';

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

  async findUserProfile(user: AuthenticatedUser) {
    const usr = await this.prisma.user.findUnique({
      where: {
        id: user.sub,
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

    if (!usr) {
      throw new NotFoundException('user not found');
    }

    return usr;
  }

  async findUserCredensialById(id: string) {
    return await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        isEmailVerified: true,
      },
    });
  }

  async createUserOauth(userData: userOauthGoogle) {
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
  ) {
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
  ) {
    const ext = file.originalname.split('.').pop();
    const objectName = `${currentUser.sub}/profile.${ext}`;

    await this.minio.uploadFile(this.userProfileBucketName, objectName, file);

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
