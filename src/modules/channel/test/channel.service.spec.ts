import { Test, TestingModule } from '@nestjs/testing';
import { ChannelService } from '../channel.service';
import {
  MockAvatarProcessorService,
  MockBannerProcessorService,
  MockMinioChannelService,
  MockNotificationChannelService,
  MockPrismaChannelService,
} from './channel.type.mock';
import {
  createMockAvatarProcessorService,
  createMockBannerProcessorService,
  createMockMinioChannelService,
  createMockNotificationChannelService,
  createMockPrismaChannelService,
} from './channel.factory.mock';
import { ChannelResult } from '../interface/channel.interface';
import { MinioService } from '~app/core/minio/minio.service';
import { PrismaService } from '~app/core/prisma/prisma.service';
import { NotificationService } from '~app/modules/notification/notification.service';
import { AvatarProcessorService } from '../avatar.processor.service';
import { BannerProcessorService } from '../banner.processor.service';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { AuthenticatedUser } from '~app/modules/auth/interface/auth.interface';
import { CreateChannelDto } from '../dto/create-channel.dto';
import {
  AVATAR_BUCKET_NAME,
  BANNER_BUCKET_NAME,
  DEFAULT_AVATAR_OBJECT_KEY,
  DEFAULT_BANNER_OBJECT_KEY,
} from '~app/core/minio/minio.constants';
import { UpdateChannelDto } from '../dto/update-channel.dto';

describe('ChannelService', () => {
  let service: ChannelService;
  let minio: MockMinioChannelService;
  let prisma: MockPrismaChannelService;
  let notif: MockNotificationChannelService;
  let avatar: MockAvatarProcessorService;
  let banner: MockBannerProcessorService;

  beforeEach(async () => {
    minio = createMockMinioChannelService();
    prisma = createMockPrismaChannelService();
    notif = createMockNotificationChannelService();
    avatar = createMockAvatarProcessorService();
    banner = createMockBannerProcessorService();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ChannelService,
        { provide: MinioService, useValue: minio },
        { provide: PrismaService, useValue: prisma },
        { provide: NotificationService, useValue: notif },
        { provide: AvatarProcessorService, useValue: avatar },
        { provide: BannerProcessorService, useValue: banner },
      ],
    }).compile();

    service = module.get<ChannelService>(ChannelService);
  });

  describe('findChannelById', () => {
    const channelResult: ChannelResult = {
      id: '7ee082e2-0c8b-4ec6-af9d-3df1ab06ab0f',
      userId: '05e1a01f-7239-4c49-b1f1-23293fea9c9a',
      avatar: 'url',
      banner: 'url',
      title: 'title',
      description: 'desc',
      isVerified: true,
      subscriberCount: 0,
      videoCount: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
    };
    const id = '573070d3-b2dc-4de4-a4e8-ee7510c1c2ec';

    it('should find channel by userId', async () => {
      prisma.channel.findUnique.mockResolvedValue(channelResult);

      prisma.channel.create.mockResolvedValue(channelResult);
      const channel = await service.findChannelById(id);

      expect(prisma.channel.findUnique).toHaveBeenCalledTimes(1);
      expect(prisma.channel.findUnique).toHaveBeenCalledWith({
        where: {
          userId: id,
        },
      });
      expect(channel).toEqual(channelResult);
    });

    it('should throw not found error when channel not found', async () => {
      prisma.channel.findUnique.mockResolvedValue(null);

      await expect(service.findChannelById(id)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('createChannel', () => {
    const user: AuthenticatedUser = {
      email: 'email@gmail.com',
      sub: 'c7b6c0da-484d-445d-8156-04c4828296ad',
    };
    const dto: CreateChannelDto = {
      description: 'desc',
      title: 'title',
    };
    const channelResult: ChannelResult = {
      id: '7ee082e2-0c8b-4ec6-af9d-3df1ab06ab0f',
      userId: '05e1a01f-7239-4c49-b1f1-23293fea9c9a',
      avatar: 'avatar-url',
      banner: 'banner-url',
      title: 'title',
      description: 'desc',
      isVerified: true,
      subscriberCount: 0,
      videoCount: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
    };

    it('should create new channel and create notification and get preSignUrl banner & avatar', async () => {
      prisma.channel.findUnique.mockResolvedValue(null);
      prisma.channel.create.mockResolvedValue(channelResult);
      minio.getFileUrl
        .mockResolvedValueOnce('banner-url')
        .mockResolvedValueOnce('avatar-url');

      const newChannel = await service.createChannel(user, dto);

      expect(prisma.channel.create).toHaveBeenCalledTimes(1);
      expect(prisma.channel.create).toHaveBeenCalledWith({
        data: {
          userId: user.sub,
          title: dto.title,
          description: dto.description,
          avatar: DEFAULT_AVATAR_OBJECT_KEY,
          banner: DEFAULT_BANNER_OBJECT_KEY,
        },
      });

      expect(notif.createNotificationCreatedChannel).toHaveBeenCalledTimes(1);
      expect(notif.createNotificationCreatedChannel).toHaveBeenCalledWith(
        {
          title: 'Congratulations! Your Channel Is Ready',
          message: 'Thank you for creating a channel on Strimo',
        },
        user,
      );

      expect(minio.getFileUrl).toHaveBeenCalledTimes(2);
      expect(minio.getFileUrl).toHaveBeenCalledWith(
        BANNER_BUCKET_NAME,
        newChannel.banner,
      );
      expect(minio.getFileUrl).toHaveBeenCalledWith(
        AVATAR_BUCKET_NAME,
        newChannel.avatar,
      );

      expect(newChannel).toEqual({
        ...channelResult,
        banner: 'banner-url',
        avatar: 'avatar-url',
      });
    });

    it('should throw config ConflictException when user already have channel', async () => {
      prisma.channel.findUnique.mockResolvedValue(channelResult);

      await expect(service.createChannel(user, dto)).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe('updateChannel', () => {
    const user: AuthenticatedUser = {
      email: 'email@gmail.com',
      sub: 'c7b6c0da-484d-445d-8156-04c4828296ad',
    };
    const dto: UpdateChannelDto = {
      description: 'desc',
      title: 'title',
    };
    const channelResult: ChannelResult = {
      id: '7ee082e2-0c8b-4ec6-af9d-3df1ab06ab0f',
      userId: '05e1a01f-7239-4c49-b1f1-23293fea9c9a',
      avatar: 'avatar-url',
      banner: 'banner-url',
      title: 'title',
      description: 'desc',
      isVerified: true,
      subscriberCount: 0,
      videoCount: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
    };

    it('should update user channel when channel exist', async () => {
      prisma.channel.findUnique.mockResolvedValue(channelResult);
      prisma.channel.update.mockResolvedValue(channelResult);
      minio.getFileUrl
        .mockResolvedValueOnce('banner-url')
        .mockResolvedValueOnce('avatar-url');

      const updatedChannel = await service.updateChannel(user, dto);

      expect(prisma.channel.findUnique).toHaveBeenCalledTimes(1);
      expect(prisma.channel.findUnique).toHaveBeenCalledWith({
        where: {
          userId: user.sub,
        },
      });

      expect(prisma.channel.update).toHaveBeenCalledWith({
        where: {
          userId: user.sub,
        },
        data: {
          description: dto.description,
          title: dto.title,
        },
      });

      expect(minio.getFileUrl).toHaveBeenCalledTimes(2);
      expect(minio.getFileUrl).toHaveBeenCalledWith(
        BANNER_BUCKET_NAME,
        updatedChannel.banner,
      );
      expect(minio.getFileUrl).toHaveBeenCalledWith(
        AVATAR_BUCKET_NAME,
        updatedChannel.avatar,
      );

      expect(updatedChannel).toEqual({
        ...updatedChannel,
        avatar: 'avatar-url',
        banner: 'banner-url',
      });
    });

    it('should throw not found error when channel not found', async () => {
      prisma.channel.findUnique.mockResolvedValue(null);

      await expect(service.updateChannel(user, dto)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('updateChannelBanner', () => {
    const user: AuthenticatedUser = {
      email: 'email@gmail.com',
      sub: 'c7b6c0da-484d-445d-8156-04c4828296ad',
    };

    const file = {
      buffer: Buffer.from('original-image'),
    } as Express.Multer.File;

    const resizedBuffer = Buffer.from('resized-image');
    const webpBuffer = Buffer.from('webp-image');

    const channelResult: ChannelResult = {
      id: '7ee082e2-0c8b-4ec6-af9d-3df1ab06ab0f',
      userId: user.sub,
      avatar: 'avatar-object-key',
      banner: 'banner-object-key',
      title: 'title',
      description: 'desc',
      isVerified: true,
      subscriberCount: 0,
      videoCount: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
    };

    it('should upload banner channel and update banner object key and delete old banner', async () => {
      prisma.channel.findUnique.mockResolvedValue({
        avatar: channelResult.avatar,
      });

      prisma.channel.update.mockResolvedValue({
        ...channelResult,
        banner: user.sub,
      });

      banner.adjustAspectRatio.mockResolvedValue(resizedBuffer);
      banner.convertToWebp.mockResolvedValue(webpBuffer);

      minio.getFileUrl.mockResolvedValue('banner-url');

      const updatedChannel = await service.updateChannelBanner(user, file);

      const webpFile: Express.Multer.File = {
        ...file,
        buffer: webpBuffer,
        size: webpBuffer.length,
        mimetype: 'image/webp',
        originalname: 'banner.webp',
      };

      expect(prisma.channel.findUnique).toHaveBeenCalledTimes(1);
      expect(prisma.channel.findUnique).toHaveBeenCalledWith({
        where: {
          userId: user.sub,
        },
        select: {
          avatar: true,
        },
      });

      expect(banner.adjustAspectRatio).toHaveBeenCalledTimes(1);
      expect(banner.adjustAspectRatio).toHaveBeenCalledWith(file.buffer);

      expect(banner.convertToWebp).toHaveBeenCalledTimes(1);
      expect(banner.convertToWebp).toHaveBeenCalledWith(resizedBuffer);

      expect(prisma.channel.update).toHaveBeenCalledWith({
        where: {
          userId: user.sub,
        },
        data: {
          banner: user.sub,
        },
      });

      expect(minio.uploadFile).toHaveBeenCalledWith(
        BANNER_BUCKET_NAME,
        user.sub,
        webpFile,
      );

      expect(minio.getFileUrl).toHaveBeenCalledWith(
        BANNER_BUCKET_NAME,
        user.sub,
      );

      expect(minio.deleteFile).toHaveBeenCalledWith(
        BANNER_BUCKET_NAME,
        channelResult.avatar,
      );

      expect(updatedChannel).toEqual({
        ...channelResult,
        banner: 'banner-url',
      });
    });

    it('throw not found error when old banner not found', async () => {
      prisma.channel.findUnique.mockResolvedValue(null);

      await expect(service.updateChannelBanner(user, file)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('updateChannelAvatar', () => {
    const user: AuthenticatedUser = {
      email: 'email@gmail.com',
      sub: 'c7b6c0da-484d-445d-8156-04c4828296ad',
    };

    const file = {
      buffer: Buffer.from('original-image'),
    } as Express.Multer.File;

    const resizedBuffer = Buffer.from('resized-image');
    const webpBuffer = Buffer.from('webp-image');

    const channelResult: ChannelResult = {
      id: '7ee082e2-0c8b-4ec6-af9d-3df1ab06ab0f',
      userId: user.sub,
      avatar: 'avatar-object-key',
      banner: 'banner-object-key',
      title: 'title',
      description: 'desc',
      isVerified: true,
      subscriberCount: 0,
      videoCount: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
    };

    it('should upload avatar channel and update avatar object key and delete old avatar', async () => {
      prisma.channel.findUnique.mockResolvedValue({
        avatar: channelResult.avatar,
      });

      prisma.channel.update.mockResolvedValue({
        ...channelResult,
        avatar: user.sub,
      });

      avatar.adjustAspectRatio.mockResolvedValue(resizedBuffer);
      avatar.convertToWebp.mockResolvedValue(webpBuffer);

      minio.getFileUrl.mockResolvedValue('avatar-url');

      const updatedChannel = await service.updateChannelAvatar(user, file);

      const webpFile: Express.Multer.File = {
        ...file,
        buffer: webpBuffer,
        size: webpBuffer.length,
        mimetype: 'image/webp',
        originalname: 'avatar.webp',
      };

      expect(prisma.channel.findUnique).toHaveBeenCalledTimes(1);

      expect(prisma.channel.findUnique).toHaveBeenCalledWith({
        where: {
          userId: user.sub,
        },
        select: {
          avatar: true,
        },
      });

      expect(avatar.adjustAspectRatio).toHaveBeenCalledTimes(1);
      expect(avatar.adjustAspectRatio).toHaveBeenCalledWith(file.buffer);

      expect(avatar.convertToWebp).toHaveBeenCalledTimes(1);
      expect(avatar.convertToWebp).toHaveBeenCalledWith(resizedBuffer);

      expect(prisma.channel.update).toHaveBeenCalledTimes(1);
      expect(prisma.channel.update).toHaveBeenCalledWith({
        where: {
          userId: user.sub,
        },
        data: {
          avatar: user.sub,
        },
      });

      expect(minio.uploadFile).toHaveBeenCalledTimes(1);
      expect(minio.uploadFile).toHaveBeenCalledWith(
        AVATAR_BUCKET_NAME,
        user.sub,
        webpFile,
      );

      expect(minio.getFileUrl).toHaveBeenCalledTimes(1);
      expect(minio.getFileUrl).toHaveBeenCalledWith(
        AVATAR_BUCKET_NAME,
        user.sub,
      );

      expect(minio.deleteFile).toHaveBeenCalledTimes(1);
      expect(minio.deleteFile).toHaveBeenCalledWith(
        AVATAR_BUCKET_NAME,
        channelResult.avatar,
      );

      expect(updatedChannel).toEqual({
        ...channelResult,
        avatar: 'avatar-url',
      });
    });

    it('should throw not found error when old avatar not found', async () => {
      prisma.channel.findUnique.mockResolvedValue(null);

      await expect(service.updateChannelAvatar(user, file)).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
