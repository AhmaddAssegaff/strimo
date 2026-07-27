import { Module } from '@nestjs/common';
import { ChannelService } from '~modules/channel/channel.service';
import { ChannelController } from '~modules/channel/channel.controller';
import { AvatarProcessorService } from '~modules/channel/avatar.processor.service';
import { BannerProcessorService } from '~modules/channel/banner.processor.service';
import { NotificationService } from '~modules/notification/notification.service';
import { SmtpService } from '~app/core/smtp/smtp.service';

@Module({
  controllers: [ChannelController],
  providers: [
    ChannelService,
    AvatarProcessorService,
    BannerProcessorService,
    NotificationService,
    SmtpService,
  ],
  exports: [
    ChannelService,
    AvatarProcessorService,
    BannerProcessorService,
    NotificationService,
    SmtpService,
  ],
})
export class ChannelModule {}
