import { Module } from '@nestjs/common';
import { ChannelService } from '~modules/channel/channel.service';
import { ChannelController } from '~modules/channel/channel.controller';
import { ChannelRepository } from './channel.repository';
import { BannerStorageModule } from '~app/core/storage/banner/banner-storage.module';
import { AvatarStorageModule } from '~app/core/storage/avatar/avatar-storage.module';

@Module({
  imports: [BannerStorageModule, AvatarStorageModule],
  controllers: [ChannelController],
  providers: [ChannelService, ChannelRepository],
  exports: [ChannelService, ChannelRepository],
})
export class ChannelModule {}
