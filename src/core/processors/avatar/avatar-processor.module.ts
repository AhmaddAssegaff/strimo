import { Module } from '@nestjs/common';
import { AvatarProcessorService } from './avatar-processor.service';

@Module({
  providers: [AvatarProcessorService],
  exports: [AvatarProcessorService],
})
export class AvatarProcessorModule {}
