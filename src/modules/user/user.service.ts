import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '~app/core/prisma/prisma.service';
import {
  AuthenticatedUser,
  UserOauthGoogle,
} from '../auth/interface/auth.interface';
import { USER_ACCOUNTS_PROVIDER } from '@prisma/client';
import { UpdateUserProfile } from './dto/update-user';
import {
  CreateUserOauthResult,
  UpdateUserProfileResult,
  UserProfileResult,
} from './interface/user.interface';
import { ProfilePictureStorageService } from '~app/core/object-storage/profile-picture-storage.service';

@Injectable()
export class UserService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly profilePictureStorage: ProfilePictureStorageService,
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

  async createUserOauth(
    userData: UserOauthGoogle,
    banner: string,
    avatar: string,
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

      const channel = await tx.channel.upsert({
        where: {
          userId: user.id,
        },
        create: {
          userId: user.id,
          title: userData.name,
          description: '',
          banner: banner,
          avatar: avatar,
        },
        update: {},
        select: {
          id: true,
        },
      });

      return {
        id: user.id,
        email: user.email,
        channel: {
          id: channel.id,
        },
      };
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

    const presignedUrl = await this.profilePictureStorage.getProfilePictureUrl(
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

    const { objectName, presignedUrl } =
      await this.profilePictureStorage.processAndUpload(currentUser.sub, file);

    const user = await this.prisma.user.update({
      where: {
        id: currentUser.sub,
      },
      data: {
        profilePicture: objectName,
      },
    });

    if (oldProfilePicture) {
      await this.profilePictureStorage.deleteProfilePicture(
        oldProfilePicture.profilePicture!,
      );
    }

    return {
      ...user,
      profilePicture: presignedUrl,
    };
  }
}
