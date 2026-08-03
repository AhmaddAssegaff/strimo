import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '~app/core/prisma/prisma.service';
import { ChannelResult } from './interface/channel.interface';
import type { AuthenticatedUser } from '../auth/interface/auth.interface';
import { AvatarStorageService } from '~app/core/object-storage/avatar-storage.service';
import { BannerStorageService } from '~app/core/object-storage/banner-storage.service';
import { UpdateChannelDto } from './dto/update-channel.dto';
import { Channel } from '@prisma/client';

@Injectable()
export class ChannelService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly avatar: AvatarStorageService,
    private readonly banner: BannerStorageService,
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

  async findChannelById(id: string): Promise<ChannelResult> {
    const channel = await this.prisma.channel.findUnique({
      where: {
        userId: id,
      },
    });

    if (!channel) {
      throw new NotFoundException('Channel not found');
    }

    return this.attachPresignedUrls(channel);
  }

  async updateChannel(
    user: AuthenticatedUser,
    updateChannelDto: UpdateChannelDto,
  ): Promise<ChannelResult> {
    const oldChannel = await this.prisma.channel.findUnique({
      where: {
        userId: user.sub,
      },
    });

    if (!oldChannel) {
      throw new NotFoundException('channel not found');
    }

    const updatedChannel = await this.prisma.channel.update({
      where: {
        userId: user.sub,
      },
      data: {
        title: updateChannelDto.title,
        description: updateChannelDto.description,
      },
    });

    return this.attachPresignedUrls(updatedChannel);
  }

  async updateChannelBanner(
    user: AuthenticatedUser,
    file: Express.Multer.File,
  ): Promise<ChannelResult> {
    const channel = await this.prisma.channel.findUnique({
      where: {
        userId: user.sub,
      },
      select: {
        id: true,
        banner: true,
      },
    });

    if (!channel) {
      throw new NotFoundException('Channel not found');
    }

    const { objectName } = await this.banner.processAndUpload(channel.id, file);
    const updatedChannelBanner = await this.prisma.channel.update({
      where: {
        userId: user.sub,
      },
      data: {
        banner: objectName,
      },
    });

    if (channel) {
      await this.banner.deleteBanner(channel.banner);
    }

    return this.attachPresignedUrls(updatedChannelBanner);
  }

  async updateChannelAvatar(
    user: AuthenticatedUser,
    file: Express.Multer.File,
  ): Promise<ChannelResult> {
    const channel = await this.prisma.channel.findUnique({
      where: {
        userId: user.sub,
      },
      select: {
        id: true,
        avatar: true,
      },
    });

    if (!channel) {
      throw new NotFoundException('Channel not found');
    }

    const { objectName } = await this.avatar.processAndUpload(channel.id, file);
    const updatedChannelAvatar = await this.prisma.channel.update({
      where: {
        userId: user.sub,
      },
      data: {
        avatar: objectName,
      },
    });

    if (channel) {
      await this.avatar.deleteAvatar(channel.avatar);
    }

    return this.attachPresignedUrls(updatedChannelAvatar);
  }
}
