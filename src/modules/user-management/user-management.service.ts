import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserDto } from '../user/dto/create-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Roles, User } from '../user/entities/user.entity';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { FindUserManagerDto } from './dto/find-manager.dto';
import { FindUserCashierDto } from './dto/find-cashier.dto';
import { UpdateStatusUserDto } from './dto/update-status-user.dto';

@Injectable()
export class UserManagementService {
  private readonly passwordHashlength = 10;

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}
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

  async findUserCashierById(id: string) {
    const user = await this.userRepository.findOne({
      where: {
        id: id,
        role: Roles.cashier,
      },
    });

    if (!user) {
      throw new NotFoundException('user not found');
    }

    return user;
  }

  async findUserManagerById(id: string) {
    const user = await this.userRepository.findOne({
      where: {
        id: id,
        role: Roles.manager,
      },
    });

    if (!user) {
      throw new NotFoundException('user not found');
    }

    return user;
  }

  async findUsersManager(findUserManagerDto: FindUserManagerDto) {
    const { page, limit } = findUserManagerDto;

    return await this.userRepository.find({
      where: {
        role: Roles.manager,
      },
      order: {
        created_at: 'DESC',
      },
      take: limit,
      skip: (page - 1) * limit,
    });
  }

  async findUsersCashier(findUserCashierDto: FindUserCashierDto) {
    const { page, limit } = findUserCashierDto;

    return await this.userRepository.find({
      where: {
        role: Roles.cashier,
      },
      order: {
        created_at: 'DESC',
      },
      take: limit,
      skip: (page - 1) * limit,
    });
  }

  async updateUserManagerStatus(
    id: string,
    updateUserStatusDto: UpdateStatusUserDto,
  ) {
    const user = await this.userRepository.findOne({
      where: { id, role: Roles.manager },
    });

    if (!user) {
      throw new NotFoundException('user not found');
    }

    return await this.userRepository.update(id, {
      status: updateUserStatusDto.status,
    });
  }

  async updateUserCashierStatus(
    id: string,
    updateUserStatusDto: UpdateStatusUserDto,
  ) {
    const user = await this.userRepository.findOne({
      where: { id, role: Roles.cashier },
    });

    if (!user) {
      throw new NotFoundException('user not found');
    }

    return await this.userRepository.update(id, {
      status: updateUserStatusDto.status,
    });
  }
}
