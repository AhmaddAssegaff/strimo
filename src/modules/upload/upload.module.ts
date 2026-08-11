import { Module } from '@nestjs/common';
import { UploadController } from './upload.controller';
import { UploadService } from './upload.service';
import { UploadRepository } from './upload.repository';
import { ObjectStorageModule } from '~app/core/object-storage/object-storage.module';
import { VideoModule } from '../video/video.module';

@Module({
  imports: [ObjectStorageModule, VideoModule],
  controllers: [UploadController],
  providers: [UploadService, UploadRepository],
  exports: [UploadService, UploadRepository],
})
export class UploadModule {}
