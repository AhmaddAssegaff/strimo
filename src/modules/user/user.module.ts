import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { PhotoProfileProcessorService } from './image-processor.service';
import { UserController } from './user.controller';

@Module({
  imports: [PhotoProfileProcessorService],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
