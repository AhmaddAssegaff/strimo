import { NotificationService } from '~app/modules/notification/notification.service';
import { ChannelService } from '../channel.service';
import { MinioService } from '~app/core/minio/minio.service';
import { AvatarProcessorService } from '../avatar.processor.service';
import { BannerProcessorService } from '../banner.processor.service';

export type MockChannelService = jest.Mocked<
  Pick<
    ChannelService,
    | 'createChannel'
    | 'findChannelById'
    | 'updateChannel'
    | 'updateChannelBanner'
    | 'updateChannelAvatar'
  >
>;

export type MockMinioChannelService = jest.Mocked<
  Pick<MinioService, 'uploadFile' | 'getFileUrl' | 'deleteFile'>
>;

export type MockPrismaChannelService = {
  channel: {
    findUnique: jest.Mock;
    create: jest.Mock;
    update: jest.Mock;
  };
};

export type MockNotificationChannelService = jest.Mocked<
  Pick<
    NotificationService,
    | 'createNotificationCreatedChannel'
    | 'findNotifications'
    | 'findNotificationById'
  >
>;

export type MockAvatarProcessorService = jest.Mocked<
  Pick<AvatarProcessorService, 'adjustAspectRatio' | 'convertToWebp'>
>;

export type MockBannerProcessorService = jest.Mocked<
  Pick<BannerProcessorService, 'adjustAspectRatio' | 'convertToWebp'>
>;
