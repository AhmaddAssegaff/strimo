import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { ProfilePictureProcessorService } from './profile-picture.proscessor.service';
import { UserController } from './user.controller';

@Module({
  controllers: [UserController],
  providers: [UserService, ProfilePictureProcessorService],
  exports: [UserService, ProfilePictureProcessorService],
})
export class UserModule {}
