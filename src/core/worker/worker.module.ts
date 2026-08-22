import { Module } from '@nestjs/common';
import { VideoTranscodingWorkerModule } from './video-worker/video-worker.module';

@Module({
  imports: [VideoTranscodingWorkerModule],
})
export class WorkerModule {}
