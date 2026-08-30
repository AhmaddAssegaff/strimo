import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { UserRepository } from './user.repository';
import { ProfilePictureStorageModule } from '~app/core/storage/profile-picture/profile-picture.module';

@Module({
  imports: [ProfilePictureStorageModule],
  controllers: [UserController],
  providers: [UserService, UserRepository],
  exports: [UserService, UserRepository],
})
export class UserModule {}
