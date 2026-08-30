import { Module } from '@nestjs/common';
import { ObjectStorageModule } from '~app/infra/object-storage/object-storage.module';
import { ProfilePictureStorageService } from './profile-picture-storage.service';
import { ProfilePictureProcessorModule } from '~app/core/processors/profile-pricture/profile-picture-processor.module';

@Module({
  imports: [ObjectStorageModule, ProfilePictureProcessorModule],
  providers: [ProfilePictureStorageService],
  exports: [ProfilePictureStorageService],
})
export class ProfilePictureStorageModule {}
