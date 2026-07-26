import { Module } from '@nestjs/common';
import { ChannelService } from './channel.service';
import { ChannelController } from './channel.controller';
import { avatarProcessorService } from './avatar.processor.service';
import { bannerProcessorService } from './banner.processor.service';

@Module({
  controllers: [ChannelController],
  providers: [ChannelService, avatarProcessorService, bannerProcessorService],
  exports: [ChannelService, avatarProcessorService, bannerProcessorService],
})
export class ChannelModule {}
