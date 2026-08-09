import { Injectable } from '@nestjs/common';
import { PrismaService } from '~app/core/prisma/prisma.service';
import { UpdateUserProfileDto } from './dto/update-user.dto';
import { UserOauthGoogle } from '../auth/interface/auth.interface';
import { USER_ACCOUNTS_PROVIDER } from '@prisma/client';

@Injectable()
export class UserRepository {
  constructor(private readonly prisma: PrismaService) {}

  async insertOauthUser(
    userData: UserOauthGoogle,
    banner: string,
    avatar: string,
  ) {
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

  async selectUserProfile(userId: string) {
    return await this.prisma.user.findUnique({
      where: {
        id: userId,
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
  }

  async updateUserProfile(
    userId: string,
    updateUserProfileDto: UpdateUserProfileDto,
  ) {
    return await this.prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        username: updateUserProfileDto.username,
      },
    });
  }

  async updateUserProfilePicture(userId: string, newObjectkey: string) {
    return await this.prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        profilePicture: newObjectkey,
      },
    });
  }
}
