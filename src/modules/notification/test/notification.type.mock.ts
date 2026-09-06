import { SmtpService } from '~app/infra/smtp/smtp.service';
import { NotificationService } from '../notification.service';

export type MockNotificationService = jest.Mocked<
  Pick<
    NotificationService,
    | 'createNotificationCreatedChannel'
    | 'findNotifications'
    | 'findNotificationById'
  >
>;

export type MockSmtpService = jest.Mocked<
  Pick<SmtpService, 'sendVerifyOtp' | 'sendChannelWelcome'>
>;

export type MockPrismaNotificationService = {
  notification: {
    create: jest.Mock;
    findMany: jest.Mock;
    findUnique: jest.Mock;
  };
};
