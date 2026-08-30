import { Module } from '@nestjs/common';
import { ObjectStorageModule } from '~app/infra/object-storage/object-storage.module';
import { AvatarStorageService } from './avatar-storage.service';
import { AvatarProcessorModule } from '~app/core/processors/avatar/avatar-processor.module';

@Module({
  imports: [ObjectStorageModule, AvatarProcessorModule],
  providers: [AvatarStorageService],
  exports: [AvatarStorageService],
})
export class AvatarStorageModule {}
