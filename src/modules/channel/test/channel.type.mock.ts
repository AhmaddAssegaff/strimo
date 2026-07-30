import { NotificationService } from '~app/modules/notification/notification.service';
import { ChannelService } from '../channel.service';
import { ObjectStorageService } from '~app/core/object-storage/object-storage.service';
import { AvatarStorageService } from '~core/object-storage/avatar-storage.service';
import { BannerStorageService } from '~core/object-storage/banner-storage.service';

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

export type MockObjectStorageChannelService = jest.Mocked<
  Pick<ObjectStorageService, 'uploadFile' | 'getFileUrl' | 'deleteFile'>
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
export type MockAvatarStorageService = jest.Mocked<
  Pick<
    AvatarStorageService,
    'processAndUpload' | 'getAvatarUrl' | 'deleteAvatar' | 'getDefaultKey'
  >
>;

export type MockBannerStorageService = jest.Mocked<
  Pick<
    BannerStorageService,
    'processAndUpload' | 'getBannerUrl' | 'deleteBanner' | 'getDefaultKey'
  >
>;
