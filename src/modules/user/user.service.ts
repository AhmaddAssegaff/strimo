import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '~app/core/prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { AuthenticatedUser } from '../auth/jwt.interface';

@Injectable()
export class UserService {
  private readonly passwordHashLength = 10;

  constructor(private readonly prisma: PrismaService) {}

  private readonly userCredentialSelect = {
    id: true,
    email: true,
    password: true,
    role: true,
    status: true,
    is_email_verified: true,
  } as const;

  async findUserCredensialById(id: string) {
    const user = await this.prisma.users.findUnique({
      where: { id },
      select: this.userCredentialSelect,
    });

    if (!user) {
      throw new NotFoundException('user not found');
    }

    return user;
  }

  async findUserCredensialByEmail(email: string) {
    const user = await this.prisma.users.findUnique({
      where: { email },
      select: {
        ...this.userCredentialSelect,

        accounts: {
          select: {
            id: true,
            provider: true,
            provider_id: true,
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('user not found');
    }

    return user;
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
    const { sub } = user;

    const foundUser = await this.prisma.users.findUnique({
      where: {
        id: sub,
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

    if (!foundUser) {
      throw new NotFoundException('user not found');
    }

    return foundUser;
  }

  async createUser(createUserDto: CreateUserDto) {
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
