import { Module } from '@nestjs/common';
import { UploadController } from './upload.controller';
import { UploadService } from './upload.service';
import { UploadRepository } from './upload.repository';
import { ObjectStorageModule } from '~app/infra/object-storage/object-storage.module';
import { VideoModule } from '../video/video.module';
import { VideoProcessingQueueModule } from '~app/core/queue/video-processing/video-processing.module';
import { VideoStorageModule } from '~app/core/storage/video/video-storage.module';

@Module({
  imports: [
    ObjectStorageModule,
    VideoModule,
    VideoProcessingQueueModule,
    VideoStorageModule,
  ],
  controllers: [UploadController],
  providers: [UploadService, UploadRepository],
  exports: [UploadService, UploadRepository],
})
export class UploadModule {}
