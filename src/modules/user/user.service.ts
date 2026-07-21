import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '~app/core/prisma/prisma.service';
import { AuthenticatedUser, userOauthGoogle } from '../auth/auth.interface';
import { USER_ACCOUNTS_PROVIDER } from '@prisma/client';

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

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
}
