import { Module } from '@nestjs/common';
import { VideoService } from './video.service';
import { VideoController } from './video.controller';
import { VideoRepository } from './video.repository';
import { ObjectStorageModule } from '~app/core/object-storage/object-storage.module';

@Module({
  imports: [ObjectStorageModule],
  controllers: [VideoController],
  providers: [VideoService, VideoRepository],
  exports: [VideoService, VideoRepository],
})
export class VideoModule {}
