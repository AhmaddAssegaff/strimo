import { Module } from '@nestjs/common';
import { AvatarProcessorService } from './avatar.processor.service';
import { BannerProcessorService } from './banner.processor.service';

@Module({
  providers: [AvatarProcessorService, BannerProcessorService],
  exports: [AvatarProcessorService, BannerProcessorService],
})
export class ChannelProcessorModule {}
