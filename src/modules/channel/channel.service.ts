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
} from '~app/core/object-storage/object-storage.constants';
import { ObjectStorageService } from '~app/core/object-storage/object-storage.service';
import { UpdateChannelDto } from './dto/update-channel.dto';
import { AvatarProcessorService } from './avatar.processor.service';
import { BannerProcessorService } from './banner.processor.service';
import { NotificationService } from '../notification/notification.service';

@Injectable()
export class ChannelService {
  constructor(
    private readonly s3Client: ObjectStorageService,
    private readonly prisma: PrismaService,
    private readonly notif: NotificationService,
    private readonly avatar: AvatarProcessorService,
    private readonly banner: BannerProcessorService,
  ) {}

  async findChannelById(id: string): Promise<ChannelResult> {
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
    const { title: channelTitle, description: channelDescription } =
      createChannelDto;

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

    await this.notif.createNotificationCreatedChannel(
      {
        title: 'Congratulations! Your Channel Is Ready',
        message: 'Thank you for creating a channel on Strimo',
      },
      user,
    );

    const [bannerUrl, avatarUrl] = await Promise.all([
      this.s3Client.getFileUrl(BANNER_BUCKET_NAME, newChannel.banner),
      this.s3Client.getFileUrl(AVATAR_BUCKET_NAME, newChannel.avatar),
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
    const { title: channelTitle, description: channelDescription } =
      updateChannelDto;

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
      this.s3Client.getFileUrl(BANNER_BUCKET_NAME, updatedChannel.banner),
      this.s3Client.getFileUrl(AVATAR_BUCKET_NAME, updatedChannel.avatar),
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
    const oldBanner = await this.prisma.channel.findUnique({
      where: {
        userId: user.sub,
      },
      select: {
        avatar: true,
      },
    });

    if (!oldBanner) {
      throw new NotFoundException('old banner not found');
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

    await this.s3Client.uploadFile(BANNER_BUCKET_NAME, objectName, webpFile);
    const preSignedUrl = await this.s3Client.getFileUrl(
      BANNER_BUCKET_NAME,
      objectName,
    );

    if (oldBanner) {
      await this.s3Client.deleteFile(BANNER_BUCKET_NAME, oldBanner.avatar);
    }

    return {
      ...updatedChannel,
      banner: preSignedUrl,
    };
  }

  async updateChannelAvatar(
    user: AuthenticatedUser,
    file: Express.Multer.File,
  ): Promise<ChannelResult> {
    const oldAvatar = await this.prisma.channel.findUnique({
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

    await this.s3Client.uploadFile(AVATAR_BUCKET_NAME, objectName, webpFile);
    const presignedUrl = await this.s3Client.getFileUrl(
      AVATAR_BUCKET_NAME,
      objectName,
    );

    if (oldAvatar) {
      await this.s3Client.deleteFile(AVATAR_BUCKET_NAME, oldAvatar.avatar);
    }

    return {
      ...updatedChannel,
      avatar: presignedUrl,
    };
  }
}
