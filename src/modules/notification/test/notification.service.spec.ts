import { Test, TestingModule } from '@nestjs/testing';
import { NotificationService } from '../notification.service';
import {
  MockPrismaNotificationService,
  MockSmtpService,
} from './notification.mock.test';
import { SmtpService } from '~app/core/smtp/smtp.service';
import { PrismaService } from '~app/core/prisma/prisma.service';
import {
  createMockPrismaNotificationService,
  createMockSmtpService,
} from './notification.factory.test';
import { CreateNotificationDto } from '../dto/create-notification.dto';
import { AuthenticatedUser } from '~app/modules/auth/interface/auth.interface';
import { NotificationResult } from '../interface/notification.interface';
import { GetNotificationDto } from '../dto/get-notifications.dto';
import { NotFoundException } from '@nestjs/common';

describe('NotificationService', () => {
  let service: NotificationService;
  let smtp: MockSmtpService;
  let prisma: MockPrismaNotificationService;

  beforeEach(async () => {
    smtp = createMockSmtpService();
    prisma = createMockPrismaNotificationService();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationService,
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

    service = module.get<NotificationService>(NotificationService);
  });

  describe('createNotificationCreatedChannel', () => {
    it('should create notification and send email', async () => {
      const notificationResult: NotificationResult = {
        message: 'message',
        title: 'title',
        id: 'b0b388ac-3fd8-40ab-85b2-a6d677cf4d77',
        userId: '6437fd84-c2bb-4f88-864d-06a0e59ecd2f',
        createdAt: new Date(),
        deletedAt: null,
      };

      const dto: CreateNotificationDto = {
        message: 'message',
        title: 'title',
      };
      const user: AuthenticatedUser = {
        email: 'email@gmail.com',
        sub: '13fe11be-5cd3-4f0d-8ce4-4b532b9f3ad6',
      };

      prisma.notification.create.mockResolvedValue(notificationResult);

      const notification = await service.createNotificationCreatedChannel(
        dto,
        user,
      );

      expect(prisma.notification.create).toHaveBeenCalledTimes(1);
      expect(prisma.notification.create).toHaveBeenCalledWith({
        data: {
          userId: user.sub,
          message: dto.message,
          title: dto.title,
        },
      });

      expect(smtp.sendChannelWelcome).toHaveBeenCalledTimes(1);
      expect(smtp.sendChannelWelcome).toHaveBeenCalledWith(user.sub);

      expect(notification).toEqual(notificationResult);
    });
  });

  describe('findNotifications', () => {
    const notificationsResult: NotificationResult[] = [
      {
        message: 'message',
        title: 'title',
        id: 'b0b388ac-3fd8-40ab-85b2-a6d677cf4d77',
        userId: '6437fd84-c2bb-4f88-864d-06a0e59ecd2f',
        createdAt: new Date(),
        deletedAt: null,
      },
    ];

    it('should only call notification.findMany', async () => {
      const dto: GetNotificationDto = {
        limit: 10,
        page: 1,
      };
      const user: AuthenticatedUser = {
        sub: '1b11bf34-50e4-4051-8d8a-fa3110338896',
        email: 'email@gmail.com',
      };
      const skip = (dto.page - 1) * dto.limit;

      prisma.notification.findMany.mockResolvedValue(notificationsResult);

      const notifications = await service.findNotifications(dto, user);

      expect(prisma.notification.findMany).toHaveBeenCalledTimes(1);
      expect(prisma.notification.findMany).toHaveBeenCalledWith({
        where: {
          userId: user.sub,
        },
        skip,
        take: dto.limit,
      });

      expect(notifications).toEqual(notificationsResult);
    });

    it('throw not found error when notification is array null', () => {
      const dto: GetNotificationDto = {
        limit: 10,
        page: 1,
      };
      const user: AuthenticatedUser = {
        sub: '1b11bf34-50e4-4051-8d8a-fa3110338896',
        email: 'email@gmail.com',
      };

      prisma.notification.findMany.mockResolvedValue([]);

      expect(service.findNotifications(dto, user)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('findNotificationById', () => {
    const notificationResult: NotificationResult = {
      message: 'message',
      title: 'title',
      id: 'b0b388ac-3fd8-40ab-85b2-a6d677cf4d77',
      userId: '6437fd84-c2bb-4f88-864d-06a0e59ecd2f',
      createdAt: new Date(),
      deletedAt: null,
    };
    const id = 'c6d30831-d6a2-4f86-8032-2a9d8bfcb147';

    it('should only call prisma.notification.findUnique', async () => {
      prisma.notification.findUnique.mockResolvedValue(notificationResult);

      const notification = await service.findNotificationById(id);

      expect(prisma.notification.findUnique).toHaveBeenCalledTimes(1);
      expect(prisma.notification.findUnique).toHaveBeenCalledWith({
        where: {
          id: id,
        },
      });

      expect(notification).toEqual(notificationResult);
    });

    it('should throw NotFoundException when notification is null', () => {
      prisma.notification.findUnique.mockResolvedValue(null);

      expect(service.findNotificationById(id)).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
