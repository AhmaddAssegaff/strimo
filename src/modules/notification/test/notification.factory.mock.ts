import {
  MockNotificationService,
  MockPrismaNotificationService,
  MockSmtpService,
} from './notification.type.mock';

export function createMockNotificationService(): MockNotificationService {
  return {
    createNotificationCreatedChannel: jest.fn(),
    findNotificationById: jest.fn(),
    findNotifications: jest.fn(),
  };
}

export function createMockPrismaNotificationService(): MockPrismaNotificationService {
  return {
    notification: {
      create: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
    },
  };
}

export function createMockSmtpService(): MockSmtpService {
  return {
    sendChannelWelcome: jest.fn(),
    sendVerifyOtp: jest.fn(),
  };
}
