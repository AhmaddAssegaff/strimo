import {
  MockChannelService,
  MockObjectStorageChannelService,
  MockNotificationChannelService,
  MockPrismaChannelService,
  MockAvatarStorageService,
  MockBannerStorageService,
} from './channel.type.mock';

export function createMockChannelService(): MockChannelService {
  return {
    findChannelById: jest.fn(),
    createChannel: jest.fn(),
    updateChannel: jest.fn(),
    updateChannelAvatar: jest.fn(),
    updateChannelBanner: jest.fn(),
  };
}

export function createMockObjectStorageChannelService(): MockObjectStorageChannelService {
  return {
    deleteFile: jest.fn(),
    getFileUrl: jest.fn(),
    uploadFile: jest.fn(),
  };
}

export function createMockPrismaChannelService(): MockPrismaChannelService {
  return {
    channel: {
      create: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
    },
  };
}

export function createMockNotificationChannelService(): MockNotificationChannelService {
  return {
    createNotificationCreatedChannel: jest.fn(),
    findNotificationById: jest.fn(),
    findNotifications: jest.fn(),
  };
}

export function createMockAvatarStorageService(): MockAvatarStorageService {
  return {
    deleteAvatar: jest.fn(),
    getAvatarUrl: jest.fn(),
    getDefaultKey: jest.fn(),
    processAndUpload: jest.fn(),
  };
}

export function createMockBannerStorageService(): MockBannerStorageService {
  return {
    getDefaultKey: jest.fn(),
    processAndUpload: jest.fn(),
    getBannerUrl: jest.fn(),
    deleteBanner: jest.fn(),
  };
}
