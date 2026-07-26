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
import { avatarProcessorService } from './avatar.processor.service';
import { bannerProcessorService } from './banner.processor.service';

@Injectable()
export class ChannelService {
  constructor(
    private readonly minio: MinioService,
    private readonly prisma: PrismaService,
    private readonly avatar: avatarProcessorService,
    private readonly banner: bannerProcessorService,
  ) {}

  async findChannelById(id: string) {
    const channel = await this.prisma.channel.findUnique({
      where: {
        userId: id,
      },
    });

    if (!channel) {
      throw new NotFoundException('Channel not found');
    }

    return channel;
  }

  async createChannel(
    user: AuthenticatedUser,
    createChannelDto: CreateChannelDto,
  ): Promise<ChannelResult> {
    const { channelTitle, channelDescription } = createChannelDto;

    const channel = await this.prisma.channel.findUnique({
      where: {
        userId: user.sub,
      },
    });

    if (channel) {
      throw new ConflictException('User already has a channel');
    }

    const newChannel = await this.prisma.channel.create({
      data: {
        userId: user.sub,
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
    const { channelTitle, channelDescription } = updateChannelDto;

    const channel = await this.prisma.channel.findUnique({
      where: {
        userId: user.sub,
      },
    });

    if (!channel) {
      throw new NotFoundException('channel not found');
    }

    const updatedChannel = await this.prisma.channel.update({
      where: {
        userId: user.sub,
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

  async updateChannelBanner(
    user: AuthenticatedUser,
    file: Express.Multer.File,
  ): Promise<ChannelResult> {
    const oldBanner = await this.prisma.channel.findUniqueOrThrow({
      where: {
        userId: user.sub,
      },
      select: {
        avatar: true,
      },
    });

    if (!oldBanner) {
      throw new NotFoundException('Channel not found');
    }

    const resizedBuffer = await this.banner.adjustAspectRatio(file.buffer);
    const webpBuffer = await this.banner.convertToWebp(resizedBuffer);
    const webpFile: Express.Multer.File = {
      ...file,
      buffer: webpBuffer,
      size: webpBuffer.length,
      mimetype: 'image/webp',
      originalname: 'banner.webp',
    };
    const objectName = `${user.sub}`;

    const updatedChannel = await this.prisma.channel.update({
      where: {
        userId: user.sub,
      },
      data: {
        banner: objectName,
      },
    });

    await this.minio.uploadFile(BANNER_BUCKET_NAME, objectName, webpFile);
    const presignedUrl = await this.minio.getFileUrl(
      BANNER_BUCKET_NAME,
      objectName,
    );

    if (oldBanner) {
      await this.minio.deleteFile(BANNER_BUCKET_NAME, oldBanner.avatar);
    }

    return {
      ...updatedChannel,
      banner: presignedUrl,
    };
  }

  async updateChannelAvatar(
    user: AuthenticatedUser,
    file: Express.Multer.File,
  ): Promise<ChannelResult> {
    const oldAvatar = await this.prisma.channel.findUniqueOrThrow({
      where: {
        userId: user.sub,
      },
      select: {
        avatar: true,
      },
    });

    if (!oldAvatar) {
      throw new NotFoundException('Channel not found');
    }

    const resizedBuffer = await this.avatar.adjustAspectRatio(file.buffer);
    const webpBuffer = await this.avatar.convertToWebp(resizedBuffer);
    const webpFile: Express.Multer.File = {
      ...file,
      buffer: webpBuffer,
      size: webpBuffer.length,
      mimetype: 'image/webp',
      originalname: 'avatar.webp',
    };
    const objectName = `${user.sub}`;

    const updatedChannel = await this.prisma.channel.update({
      where: {
        userId: user.sub,
      },
      data: {
        avatar: objectName,
      },
    });

    await this.minio.uploadFile(AVATAR_BUCKET_NAME, objectName, webpFile);
    const presignedUrl = await this.minio.getFileUrl(
      AVATAR_BUCKET_NAME,
      objectName,
    );

    if (oldAvatar) {
      await this.minio.deleteFile(BANNER_BUCKET_NAME, oldAvatar.avatar);
    }

    return {
      ...updatedChannel,
      avatar: presignedUrl,
    };
  }
}
