import { Module } from '@nestjs/common';
import { UserManagementService } from './user-management.service';
import { UserManagementController } from './user-management.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../user/entities/user.entity';
import { UserAccounts } from '../user/entities/user-accounts.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, UserAccounts])],
  controllers: [UserManagementController],
  providers: [UserManagementService],
})
export class UserManagementModule {}
