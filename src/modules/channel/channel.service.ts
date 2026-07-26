import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateChannelDto } from './dto/create-channel.dto';
import { PrismaService } from '~app/core/prisma/prisma.service';
import { ChannelResult } from './interface/channel.interface';
import type { AuthenticatedUser } from '../auth/interface/auth.interface';
import {
  DEFAULT_AVATAR_OBJECT_KEY,
  DEFAULT_BANNER_OBJECT_KEY,
  AVATAR_BUCKET_NAME,
  BANNER_BUCKET_NAME,
} from '~core/minio/minio.constants';
import { MinioService } from '~app/core/minio/minio.service';
import { UpdateChannelDto } from './dto/update-channel.dto';

@Injectable()
export class ChannelService {
  constructor(
    private readonly minio: MinioService,
    private readonly prisma: PrismaService,
  ) {}

  async createChannel(
    user: AuthenticatedUser,
    createChannelDto: CreateChannelDto,
  ): Promise<ChannelResult> {
    const { sub } = user;
    const { channelTitle, channelDescription } = createChannelDto;

    const channel = await this.prisma.channel.findUnique({
      where: {
        userId: sub,
      },
    });

    if (channel) {
      throw new ConflictException('User already has a channel');
    }

    const newChannel = await this.prisma.channel.create({
      data: {
        userId: sub,
        title: channelTitle,
        description: channelDescription,
        avatar: DEFAULT_AVATAR_OBJECT_KEY,
        banner: DEFAULT_BANNER_OBJECT_KEY,
      },
    });
    const [bannerUrl, avatarUrl] = await Promise.all([
      this.minio.getFileUrl(BANNER_BUCKET_NAME, newChannel.banner),
      this.minio.getFileUrl(AVATAR_BUCKET_NAME, newChannel.avatar),
    ]);

    return {
      ...newChannel,
      avatar: avatarUrl,
      banner: bannerUrl,
    };
  }

  async updateChannel(
    user: AuthenticatedUser,
    updateChannelDto: UpdateChannelDto,
  ): Promise<ChannelResult> {
    const { sub } = user;
    const { channelTitle, channelDescription } = updateChannelDto;

    const channel = await this.prisma.channel.findUnique({
      where: {
        userId: sub,
      },
    });

    if (!channel) {
      throw new NotFoundException('channel not found');
    }

    const updatedChannel = await this.prisma.channel.update({
      where: {
        userId: sub,
      },
      data: {
        description: channelDescription,
        title: channelTitle,
      },
    });

    const [bannerUrl, avatarUrl] = await Promise.all([
      this.minio.getFileUrl(BANNER_BUCKET_NAME, updatedChannel.banner),
      this.minio.getFileUrl(AVATAR_BUCKET_NAME, updatedChannel.avatar),
    ]);

    return {
      ...updatedChannel,
      avatar: avatarUrl,
      banner: bannerUrl,
    };
  }
}
