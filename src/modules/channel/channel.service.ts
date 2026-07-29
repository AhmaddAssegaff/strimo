import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateChannelDto } from './dto/create-channel.dto';
import { PrismaService } from '~app/core/prisma/prisma.service';
import { ChannelResult } from './interface/channel.interface';
import type { AuthenticatedUser } from '../auth/interface/auth.interface';
import { AvatarStorageService } from '~app/core/object-storage/avatar-storage.service';
import { BannerStorageService } from '~app/core/object-storage/banner-storage.service';
import { UpdateChannelDto } from './dto/update-channel.dto';
import { NotificationService } from '../notification/notification.service';
import { Channel } from '@prisma/client';

@Injectable()
export class ChannelService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notif: NotificationService,
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

  async createChannel(
    user: AuthenticatedUser,
    createChannelDto: CreateChannelDto,
  ): Promise<ChannelResult> {
    const oldChannel = await this.prisma.channel.findUnique({
      where: {
        userId: user.sub,
      },
    });

    if (oldChannel) {
      throw new ConflictException('User already has a channel');
    }

    const newChannel = await this.prisma.channel.create({
      data: {
        userId: user.sub,
        title: createChannelDto.title,
        description: createChannelDto.description,
        avatar: this.avatar.getDefaultKey(),
        banner: this.banner.getDefaultKey(),
      },
    });

    await this.notif.createNotificationCreatedChannel(user);

    return this.attachPresignedUrls(newChannel);
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
    const oldChannel = await this.prisma.channel.findUnique({
      where: {
        userId: user.sub,
      },
      select: {
        banner: true,
      },
    });

    if (!oldChannel) {
      throw new NotFoundException('Channel not found');
    }

    const { objectName } = await this.banner.processAndUpload(user.sub, file);
    const updatedChannelBanner = await this.prisma.channel.update({
      where: {
        userId: user.sub,
      },
      data: {
        banner: objectName,
      },
    });

    if (oldChannel) {
      await this.banner.deleteBanner(oldChannel.banner);
    }

    return this.attachPresignedUrls(updatedChannelBanner);
  }

  async updateChannelAvatar(
    user: AuthenticatedUser,
    file: Express.Multer.File,
  ): Promise<ChannelResult> {
    const oldChannel = await this.prisma.channel.findUnique({
      where: {
        userId: user.sub,
      },
      select: {
        avatar: true,
      },
    });

    if (!oldChannel) {
      throw new NotFoundException('Channel not found');
    }

    const { objectName } = await this.avatar.processAndUpload(user.sub, file);
    const updatedChannelAvatar = await this.prisma.channel.update({
      where: {
        userId: user.sub,
      },
      data: {
        avatar: objectName,
      },
    });

    if (oldChannel) {
      await this.avatar.deleteAvatar(oldChannel.avatar);
    }

    return this.attachPresignedUrls(updatedChannelAvatar);
  }
}
