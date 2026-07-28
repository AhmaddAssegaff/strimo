import { Test, TestingModule } from '@nestjs/testing';
import { NotificationController } from '../notification.controller';
import { NotificationService } from '../notification.service';
import {
  MockNotificationService,
  MockPrismaNotificationService,
  MockSmtpService,
} from './notification.mock.test';
import {
  createMockNotificationService,
  createMockPrismaNotificationService,
  createMockSmtpService,
} from './notification.factory.test';
import { SmtpService } from '~app/core/smtp/smtp.service';
import { PrismaService } from '~app/core/prisma/prisma.service';
import { GetNotificationDto } from '../dto/get-notifications.dto';
import { AuthenticatedUser } from '~app/modules/auth/interface/auth.interface';

describe('NotificationController', () => {
  let controller: NotificationController;
  let service: MockNotificationService;
  let smtp: MockSmtpService;
  let prisma: MockPrismaNotificationService;

  beforeEach(async () => {
    service = createMockNotificationService();
    smtp = createMockSmtpService();
    prisma = createMockPrismaNotificationService();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [NotificationController],
      providers: [
        NotificationService,
        {
          provide: NotificationService,
          useValue: service,
        },
        {
          provide: SmtpService,
          useValue: smtp,
        },
        {
          provide: PrismaService,
          useValue: prisma,
        },
      ],
    }).compile();

    controller = module.get<NotificationController>(NotificationController);
  });

  describe('getAllNotifications', () => {
    it('should only call notificationService.findNotifications', async () => {
      const dto: GetNotificationDto = {
        limit: 10,
        page: 1,
      };
      const user: AuthenticatedUser = {
        email: 'email@gmail.com',
        sub: '413f31b4-efa9-45e9-beb1-ab0cae22bd28',
      };

      await controller.getAllNotifications(dto, user);

      expect(service.findNotifications).toHaveBeenCalledTimes(1);
      expect(service.findNotifications).toHaveBeenCalledWith(dto, user);
    });
  });

  describe('getNotificationById', () => {
    it('should only call notificationService.findNotificationById', async () => {
      const id = '8b2b54a1-efe3-41e4-b69b-aec968eacf16';

      await controller.getNotificationById(id);

      expect(service.findNotificationById).toHaveBeenCalledTimes(1);
      expect(service.findNotificationById).toHaveBeenCalledWith(id);
    });
  });
});
