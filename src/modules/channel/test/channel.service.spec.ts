import { Test, TestingModule } from '@nestjs/testing';
import { ChannelService } from '../channel.service';
import {
  MockNotificationChannelService,
  MockPrismaChannelService,
  MockAvatarStorageService,
  MockBannerStorageService,
} from './channel.type.mock';
import {
  createMockNotificationChannelService,
  createMockPrismaChannelService,
  createMockBannerStorageService,
  createMockAvatarStorageService,
} from './channel.factory.mock';
import { ChannelResult } from '../interface/channel.interface';
import { PrismaService } from '~app/core/prisma/prisma.service';
import { NotificationService } from '~app/modules/notification/notification.service';
import { AvatarStorageService } from '~app/core/object-storage/avatar-storage.service';
import { BannerStorageService } from '~app/core/object-storage/banner-storage.service';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { AuthenticatedUser } from '~app/modules/auth/interface/auth.interface';
import { CreateChannelDto } from '../dto/create-channel.dto';
import { UpdateChannelDto } from '../dto/update-channel.dto';

describe('ChannelService', () => {
  let service: ChannelService;
  let prisma: MockPrismaChannelService;
  let notif: MockNotificationChannelService;
  let avatar: MockAvatarStorageService;
  let banner: MockBannerStorageService;

  beforeEach(async () => {
    prisma = createMockPrismaChannelService();
    notif = createMockNotificationChannelService();
    avatar = createMockAvatarStorageService();
    banner = createMockBannerStorageService();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ChannelService,
        { provide: PrismaService, useValue: prisma },
        { provide: NotificationService, useValue: notif },
        { provide: AvatarStorageService, useValue: avatar },
        { provide: BannerStorageService, useValue: banner },
      ],
    }).compile();

    service = module.get<ChannelService>(ChannelService);
  });

  describe('findChannelById', () => {
    const channelResult: ChannelResult = {
      id: '7ee082e2-0c8b-4ec6-af9d-3df1ab06ab0f',
      userId: '05e1a01f-7239-4c49-b1f1-23293fea9c9a',
      avatar: 'default-avatar-key',
      banner: 'default-banner-key',
      title: 'title',
      description: 'desc',
      isVerified: true,
      subscriberCount: 0,
      videoCount: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
    };
    const id = '05e1a01f-7239-4c49-b1f1-23293fea9c9a';

    it('should find channel by userId and attach presigned urls', async () => {
      prisma.channel.findUnique.mockResolvedValue(channelResult);
      banner.getBannerUrl.mockResolvedValue('presigned-banner-url');
      avatar.getAvatarUrl.mockResolvedValue('presigned-avatar-url');

      const channel = await service.findChannelById(id);

      expect(prisma.channel.findUnique).toHaveBeenCalledTimes(1);
      expect(prisma.channel.findUnique).toHaveBeenCalledWith({
        where: { userId: id },
      });
      expect(banner.getBannerUrl).toHaveBeenCalledWith('default-banner-key');
      expect(avatar.getAvatarUrl).toHaveBeenCalledWith('default-avatar-key');

      expect(channel).toEqual({
        ...channelResult,
        banner: 'presigned-banner-url',
        avatar: 'presigned-avatar-url',
      });
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
      userId: user.sub,
      avatar: 'default-avatar-key',
      banner: 'default-banner-key',
      title: 'title',
      description: 'desc',
      isVerified: false,
      subscriberCount: 0,
      videoCount: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
    };

    it('should create new channel, create notification, and return presigned URLs', async () => {
      prisma.channel.findUnique.mockResolvedValue(null);
      avatar.getDefaultKey.mockReturnValue('default-avatar-key');
      banner.getDefaultKey.mockReturnValue('default-banner-key');
      prisma.channel.create.mockResolvedValue(channelResult);

      banner.getBannerUrl.mockResolvedValue('presigned-banner-url');
      avatar.getAvatarUrl.mockResolvedValue('presigned-avatar-url');

      const newChannel = await service.createChannel(user, dto);

      expect(prisma.channel.create).toHaveBeenCalledTimes(1);
      expect(prisma.channel.create).toHaveBeenCalledWith({
        data: {
          userId: user.sub,
          title: dto.title,
          description: dto.description,
          avatar: 'default-avatar-key',
          banner: 'default-banner-key',
        },
      });

      expect(notif.createNotificationCreatedChannel).toHaveBeenCalledTimes(1);
      expect(notif.createNotificationCreatedChannel).toHaveBeenCalledWith(user);

      expect(banner.getBannerUrl).toHaveBeenCalledWith('default-banner-key');
      expect(avatar.getAvatarUrl).toHaveBeenCalledWith('default-avatar-key');

      expect(newChannel).toEqual({
        ...channelResult,
        banner: 'presigned-banner-url',
        avatar: 'presigned-avatar-url',
      });
    });

    it('should throw ConflictException when user already has a channel', async () => {
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
      description: 'updated desc',
      title: 'updated title',
    };
    const channelResult: ChannelResult = {
      id: '7ee082e2-0c8b-4ec6-af9d-3df1ab06ab0f',
      userId: user.sub,
      avatar: 'avatar-key',
      banner: 'banner-key',
      title: 'updated title',
      description: 'updated desc',
      isVerified: true,
      subscriberCount: 0,
      videoCount: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
    };

    it('should update user channel when channel exists', async () => {
      prisma.channel.findUnique.mockResolvedValue(channelResult);
      prisma.channel.update.mockResolvedValue(channelResult);
      banner.getBannerUrl.mockResolvedValue('presigned-banner-url');
      avatar.getAvatarUrl.mockResolvedValue('presigned-avatar-url');

      const updatedChannel = await service.updateChannel(user, dto);

      expect(prisma.channel.findUnique).toHaveBeenCalledTimes(1);
      expect(prisma.channel.update).toHaveBeenCalledWith({
        where: { userId: user.sub },
        data: {
          description: dto.description,
          title: dto.title,
        },
      });

      expect(updatedChannel).toEqual({
        ...channelResult,
        banner: 'presigned-banner-url',
        avatar: 'presigned-avatar-url',
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
    const file = {} as Express.Multer.File;
    const channelResult: ChannelResult = {
      id: '7ee082e2-0c8b-4ec6-af9d-3df1ab06ab0f',
      userId: user.sub,
      avatar: 'avatar-key',
      banner: 'new-banner-key',
      title: 'title',
      description: 'desc',
      isVerified: true,
      subscriberCount: 0,
      videoCount: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
    };
    const channelId = '9b2dae7e-8325-4abe-8f2d-90f100047322';

    it('should process, upload new banner, update DB, delete old banner, and return result', async () => {
      prisma.channel.findUnique.mockResolvedValue({
        id: channelId,
        banner: 'old-banner-key',
      });
      banner.processAndUpload.mockResolvedValue({
        objectName: 'new-banner-key',
        presignedUrl: 'temp-url',
      });
      prisma.channel.update.mockResolvedValue(channelResult);

      banner.getBannerUrl.mockResolvedValue('presigned-banner-url');
      avatar.getAvatarUrl.mockResolvedValue('presigned-avatar-url');

      const updatedChannel = await service.updateChannelBanner(user, file);

      expect(prisma.channel.findUnique).toHaveBeenCalledWith({
        where: { userId: user.sub },
        select: { id: true, banner: true },
      });

      expect(banner.processAndUpload).toHaveBeenCalledWith(channelId, file);

      expect(prisma.channel.update).toHaveBeenCalledWith({
        where: { userId: user.sub },
        data: { banner: 'new-banner-key' },
      });

      expect(banner.deleteBanner).toHaveBeenCalledWith('old-banner-key');

      expect(updatedChannel).toEqual({
        ...channelResult,
        banner: 'presigned-banner-url',
        avatar: 'presigned-avatar-url',
      });
    });

    it('should throw NotFoundException when channel does not exist', async () => {
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
    const file = {} as Express.Multer.File;
    const channelResult: ChannelResult = {
      id: '7ee082e2-0c8b-4ec6-af9d-3df1ab06ab0f',
      userId: user.sub,
      avatar: 'new-avatar-key',
      banner: 'banner-key',
      title: 'title',
      description: 'desc',
      isVerified: true,
      subscriberCount: 0,
      videoCount: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
    };
    const channelId = '9b2dae7e-8325-4abe-8f2d-90f100047322';

    it('should process, upload new avatar, update DB, delete old avatar, and return result', async () => {
      prisma.channel.findUnique.mockResolvedValue({
        id: channelId,
        avatar: 'old-avatar-key',
      });
      avatar.processAndUpload.mockResolvedValue({
        objectName: 'new-avatar-key',
        presignedUrl: 'temp-url',
      });
      prisma.channel.update.mockResolvedValue(channelResult);

      banner.getBannerUrl.mockResolvedValue('presigned-banner-url');
      avatar.getAvatarUrl.mockResolvedValue('presigned-avatar-url');

      const updatedChannel = await service.updateChannelAvatar(user, file);

      expect(prisma.channel.findUnique).toHaveBeenCalledWith({
        where: { userId: user.sub },
        select: { id: true, avatar: true },
      });

      expect(avatar.processAndUpload).toHaveBeenCalledWith(channelId, file);

      expect(prisma.channel.update).toHaveBeenCalledWith({
        where: { userId: user.sub },
        data: { avatar: 'new-avatar-key' },
      });

      expect(avatar.deleteAvatar).toHaveBeenCalledWith('old-avatar-key');

      expect(updatedChannel).toEqual({
        ...channelResult,
        banner: 'presigned-banner-url',
        avatar: 'presigned-avatar-url',
      });
    });

    it('should throw NotFoundException when channel does not exist', async () => {
      prisma.channel.findUnique.mockResolvedValue(null);

      await expect(service.updateChannelAvatar(user, file)).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
