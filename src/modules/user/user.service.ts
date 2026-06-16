import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { AuthenticatedUser } from '../auth/jwt.interface';

@Injectable()
export class UserService {
  private readonly passwordHashlength = 10;

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async findUserCredensialById(id: string) {
    const user = await this.userRepository.findOne({
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

    if (!user) {
      throw new NotFoundException('user not found');
    }

    return user;
  }

  async findUserCredensialByEmail(email: string) {
    const user = await this.userRepository.findOne({
      where: { email },
      select: {
        id: true,
        email: true,
        password: true,
        role: true,
        status: true,
        is_email_verified: true,
      },
      relations: {
        accounts: true,
      },
    });

    console.log(user);

    if (!user) {
      throw new NotFoundException('user not found');
    }

    return user;
  }

  async updateVerifyStatus(userId: string) {
    return await this.userRepository.update(
      { id: userId },
      { is_email_verified: true },
    );
  }

  async findUserProfile(user: AuthenticatedUser) {
    const { sub } = user;
    return await this.userRepository.findOneBy({ id: sub });
  }

  async createUser(createUserDto: CreateUserDto) {
    const existingUser = await this.userRepository.findOne({
      where: {
        email: createUserDto.email,
      },
    });

    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    const hashedPassword = await bcrypt.hash(
      createUserDto.password,
      this.passwordHashlength,
    );

    const user = this.userRepository.create({
      ...createUserDto,
      password: hashedPassword,
    });

    const savedUser = await this.userRepository.save(user);
    const { password: _password, ...result } = savedUser;

    return result;
  }
}
