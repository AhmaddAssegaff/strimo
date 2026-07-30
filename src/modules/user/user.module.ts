import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { UserProcessorModule } from './processor/user.processor.module';
import { ObjectStorageModule } from '~app/core/object-storage/object-storage.module';

@Module({
  imports: [UserProcessorModule, ObjectStorageModule],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
