import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '~app/core/prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { AuthenticatedUser, userOauthGoogle } from '../auth/auth.interface';
import { USER_ACCOUNTS_PROVIDER, USER_ROLES } from '@prisma/client';

@Injectable()
export class UserService {
  private readonly passwordHashLength = 10;

  constructor(private readonly prisma: PrismaService) {}

  async findUserCredensialById(id: string) {
    return await this.prisma.users.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        password: true,
        role: true,
        status: true,
        is_email_verified: true,
      },
    });
  }

  async findUserCredensialByEmail(email: string) {
    return await this.prisma.users.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        password: true,
        role: true,
        status: true,
        is_email_verified: true,
        accounts: {
          select: {
            id: true,
            provider: true,
            provider_id: true,
          },
        },
      },
    });
  }

  async updateVerifyStatus(userId: string) {
    return await this.prisma.users.update({
      where: {
        id: userId,
      },
      data: {
        is_email_verified: true,
      },
    });
  }

  async findUserProfile(user: AuthenticatedUser) {
    const usr = await this.prisma.users.findUnique({
      where: {
        id: user.sub,
      },
      select: {
        id: true,
        email: true,
        username: true,
        profile_picture: true,
        phone_number: true,
        role: true,
        status: true,
        is_email_verified: true,
        created_at: true,
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
    return await this.prisma.user_account.create({
      data: {
        provider: provider,
        user_id: userId,
        provider_id: providerId,
      },
    });
  }

  async createUserOauth(userData: userOauthGoogle) {
    const user = await this.prisma.$transaction(async (tx) => {
      const newUser = await tx.users.upsert({
        where: {
          email: userData.email,
        },
        create: {
          email: userData.email,
          username: userData.name,
          role: USER_ROLES.cashier,
          profile_picture: userData.picture,
          is_email_verified: true,
        },
        update: {
          is_email_verified: true,
        },
        select: {
          id: true,
          email: true,
          role: true,
        },
      });

      await tx.user_account.upsert({
        where: {
          provider_provider_id: {
            provider: USER_ACCOUNTS_PROVIDER.google,
            provider_id: userData.googleId,
          },
        },
        create: {
          user_id: newUser.id,
          provider: USER_ACCOUNTS_PROVIDER.google,
          provider_id: userData.googleId,
        },
        update: {
          provider_id: userData.googleId,
        },
      });

      return newUser;
    });

    return user;
  }

  async createUserLocal(createUserDto: CreateUserDto) {
    const existingUser = await this.prisma.users.findUnique({
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

    return await this.prisma.users.create({
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
        is_email_verified: true,
        created_at: true,
      },
    });
  }
}
