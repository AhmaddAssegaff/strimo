import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { PhotoProfileProcessorService } from './image-processor.service';
import { UserController } from './user.controller';

@Module({
  controllers: [UserController],
  providers: [UserService, PhotoProfileProcessorService],
  exports: [UserService, PhotoProfileProcessorService],
})
export class UserModule {}
