import { Injectable, NotFoundException } from '@nestjs/common';
import { ChannelResult } from './interface/channel.interface';
import type { AuthenticatedUser } from '../auth/interface/auth.interface';
import { AvatarStorageService } from '~app/core/object-storage/avatar-storage.service';
import { BannerStorageService } from '~app/core/object-storage/banner-storage.service';
import { UpdateChannelDto } from './dto/update-channel.dto';
import { Channel } from '@prisma/client';
import { ChannelRepository } from './channel.repository';

@Injectable()
export class ChannelService {
  constructor(
    private readonly avatar: AvatarStorageService,
    private readonly banner: BannerStorageService,
    private readonly channelRepo: ChannelRepository,
  ) {}

  private async attachPresignedUrls(channel: Channel): Promise<ChannelResult> {
    const [bannerUrl, avatarUrl] = await Promise.all([
      this.banner.getBannerUrl(channel.banner),
      this.avatar.getAvatarUrl(channel.avatar),
    ]);

    return {
      ...channel,
      banner: bannerUrl,
      avatar: avatarUrl,
    };
  }

  async findChannelById(channelId: string): Promise<ChannelResult> {
    const channel = await this.channelRepo.selectChannelById(channelId);

    if (!channel) {
      throw new NotFoundException('Channel not found');
    }

    return this.attachPresignedUrls(channel);
  }

  async updateChannel(
    user: AuthenticatedUser,
    updateChannelDto: UpdateChannelDto,
  ): Promise<ChannelResult> {
    const updatedChannel = await this.channelRepo.updateChannel(
      user.channelId,
      user.sub,
      updateChannelDto,
    );

    return this.attachPresignedUrls(updatedChannel);
  }

  async updateChannelBanner(
    user: AuthenticatedUser,
    file: Express.Multer.File,
  ): Promise<ChannelResult> {
    const channel = await this.channelRepo.selectChannelByIdAndUserId(
      user.channelId,
      user.sub,
    );

    if (!channel) {
      throw new NotFoundException('Channel not found');
    }

    await this.banner.deleteBanner(user.channelId);
    await this.banner.processAndUpload(user.channelId, file);

    return this.attachPresignedUrls(channel);
  }

  async updateChannelAvatar(
    user: AuthenticatedUser,
    file: Express.Multer.File,
  ): Promise<ChannelResult> {
    const channel = await this.channelRepo.selectChannelByIdAndUserId(
      user.channelId,
      user.sub,
    );

    if (!channel) {
      throw new NotFoundException('Channel not found');
    }

    await this.avatar.deleteAvatar(user.channelId);
    await this.avatar.processAndUpload(user.channelId, file);

    return this.attachPresignedUrls(channel);
  }
}
