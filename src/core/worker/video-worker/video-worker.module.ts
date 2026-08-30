import { Module } from '@nestjs/common';
import { FfmpegModule } from '~app/core/ffmpeg/ffmpeg.module';
import { FfprobeModule } from '~app/core/ffprobe/ffprobe.module';
import { ShakaPackagerModule } from '~app/core/shaka-packager/shaka-packager.module';
import { VideoTranscodingWorker } from './video-worker.service';
import { VideoProcessingQueueModule } from '~app/core/queue/video-processing/video-processing.module';
import { ObjectStorageModule } from '~app/infra/object-storage/object-storage.module';
import { VideoModule } from '~app/modules/video/video.module';
import { VideoStorageModule } from '~app/core/storage/video/video-storage.module';

@Module({
  imports: [
    FfmpegModule,
    FfprobeModule,
    ShakaPackagerModule,
    VideoProcessingQueueModule,
    ObjectStorageModule,
    VideoModule,
    VideoStorageModule,
  ],
  providers: [VideoTranscodingWorker],
})
export class VideoTranscodingWorkerModule {}
