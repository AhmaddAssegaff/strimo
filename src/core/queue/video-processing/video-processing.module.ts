import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { VIDEO_PROCESSING_QUEUE_NAME } from '../queue.constant';

@Module({
  imports: [
    BullModule.registerQueue({
      name: VIDEO_PROCESSING_QUEUE_NAME,
      defaultJobOptions: {
        attempts: 3,
        backoff: {
          type: 'fixed',
          delay: 3000,
        },
      },
    }),
  ],
  exports: [BullModule],
})
export class VideoProcessingQueueModule {}
