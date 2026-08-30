import { Module } from '@nestjs/common';
import { ObjectStorageModule } from '~app/infra/object-storage/object-storage.module';
import { VideoStorageService } from './video-storage.service';

@Module({
  imports: [ObjectStorageModule],
  providers: [VideoStorageService],
  exports: [VideoStorageService],
})
export class VideoStorageModule {}
