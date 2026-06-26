import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '~app/core/prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { AuthenticatedUser, userOauthGoogle } from '../auth/auth.interface';
import { USER_ACCOUNTS_PROVIDER, USER_ROLES } from '@prisma/client';

@Injectable()
export class UserService {
  private readonly passwordHashLength = 10;

  constructor(private readonly prisma: PrismaService) {}

  async findUserCredensialById(id: string) {
    return await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        password: true,
        role: true,
        status: true,
        isEmailVerified: true,
      },
    });
  }

  async findUserCredensialByEmail(email: string) {
    return await this.prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        password: true,
        role: true,
        status: true,
        isEmailVerified: true,
        accounts: {
          select: {
            id: true,
            provider: true,
            providerId: true,
          },
        },
      },
    });
  }

  async updateVerifyStatus(userId: string) {
    return await this.prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        isEmailVerified: true,
      },
    });
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
        phoneNumber: true,
        role: true,
        status: true,
        isEmailVerified: true,
        createdAt: true,
      },
    });

    if (!usr) {
      throw new NotFoundException('user not found');
    }

    return usr;
  }

  async createNewAccount(
    provider: USER_ACCOUNTS_PROVIDER,
    userId: string,
    providerId: string,
  ) {
    return await this.prisma.userAccount.create({
      data: {
        provider: provider,
        userId: userId,
        providerId: providerId,
      },
    });
  }

  async createUserOauth(userData: userOauthGoogle) {
    const user = await this.prisma.$transaction(async (tx) => {
      const newUser = await tx.user.upsert({
        where: {
          email: userData.email,
        },
        create: {
          email: userData.email,
          username: userData.name,
          role: USER_ROLES.cashier,
          profilePicture: userData.picture,
          isEmailVerified: true,
        },
        update: {
          isEmailVerified: true,
        },
        select: {
          id: true,
          email: true,
          role: true,
        },
      });

      await tx.userAccount.upsert({
        where: {
          provider_providerId: {
            provider: USER_ACCOUNTS_PROVIDER.google,
            providerId: userData.googleId,
          },
        },
        create: {
          userId: newUser.id,
          provider: USER_ACCOUNTS_PROVIDER.google,
          providerId: userData.googleId,
        },
        update: {
          providerId: userData.googleId,
        },
      });

      return newUser;
    });

    return user;
  }

  async createUserLocal(createUserDto: CreateUserDto) {
    const existingUser = await this.prisma.user.findUnique({
      where: {
        email: createUserDto.email,
      },
    });

    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    const hashedPassword = await bcrypt.hash(
      createUserDto.password,
      this.passwordHashLength,
    );

    return await this.prisma.user.create({
      data: {
        ...createUserDto,
        password: hashedPassword,
        role: USER_ROLES.cashier,
        accounts: {
          create: {
            provider: 'local',
          },
        },
      },

      select: {
        id: true,
        email: true,
        username: true,
        role: true,
        status: true,
        isEmailVerified: true,
        createdAt: true,
      },
    });
  }
}
