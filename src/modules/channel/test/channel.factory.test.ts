import {
  MockAvatarProcessorService,
  MockBannerProcessorService,
  MockChannelService,
  MockMinioChannelService,
  MockNotificationChannelService,
  MockPrismaChannelService,
} from './channel.mock.test';

export function createMockChannelService(): MockChannelService {
  return {
    findChannelById: jest.fn(),
    createChannel: jest.fn(),
    updateChannel: jest.fn(),
    updateChannelAvatar: jest.fn(),
    updateChannelBanner: jest.fn(),
  };
}

export function createMockMinioChannelService(): MockMinioChannelService {
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

export function createMockBannerProcessorService(): MockBannerProcessorService {
  return {
    adjustAspectRatio: jest.fn(),
    convertToWebp: jest.fn(),
  };
}

export function createMockAvatarProcessorService(): MockAvatarProcessorService {
  return {
    adjustAspectRatio: jest.fn(),
    convertToWebp: jest.fn(),
  };
}
