import { Module } from '@nestjs/common';
import { ChannelService } from '~modules/channel/channel.service';
import { ChannelController } from '~modules/channel/channel.controller';
import { ChannelProcessorModule } from './processor/channel.processor.module';
import { ObjectStorageModule } from '~app/core/object-storage/object-storage.module';
import { ChannelRepository } from './channel.repository';

@Module({
  imports: [ChannelProcessorModule, ObjectStorageModule],
  controllers: [ChannelController],
  providers: [ChannelService, ChannelRepository],
  exports: [ChannelService, ChannelRepository],
})
export class ChannelModule {}
