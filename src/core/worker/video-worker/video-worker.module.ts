import { Module } from '@nestjs/common';
import { FfmpegModule } from '~app/core/ffmpeg/ffmpeg.module';
import { FfprobeModule } from '~app/core/ffprobe/ffprobe.module';
import { ShakaPackagerModule } from '~app/core/shaka-packager/shaka-packager.module';
import { VideoTranscodingWorker } from './video-worker.service';
import { VideoProcessingQueueModule } from '~app/core/queue/video-processing/video-processing.module';
import { ObjectStorageModule } from '~app/core/object-storage/object-storage.module';

@Module({
  imports: [
    FfmpegModule,
    FfprobeModule,
    ShakaPackagerModule,
    VideoProcessingQueueModule,
    ObjectStorageModule,
  ],
  providers: [VideoTranscodingWorker],
})
export class VideoTranscodingWorkerModule {}
