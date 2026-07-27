import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { GetNotificationDto } from './dto/get-notifications.dto';
import { PrismaService } from '~app/core/prisma/prisma.service';
import { SmtpService } from '~app/core/smtp/smtp.service';
import { AuthenticatedUser } from '../auth/interface/auth.interface';
import { NotficationResult } from './interface/notification.interface';

@Injectable()
export class NotificationService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly smtp: SmtpService,
  ) {}

  async createNotificationCreatedChannel(
    createNotificationDto: CreateNotificationDto,
    user: AuthenticatedUser,
  ): Promise<NotficationResult> {
    const { title, message } = createNotificationDto;
    const notification = this.prisma.notification.create({
      data: {
        userId: user.sub,
        message: message,
        title: title,
      },
    });
    await this.smtp.sendChannelWelcome(user.sub);

    return notification;
  }

  async findNotifications(
    getNotificationDto: GetNotificationDto,
    user: AuthenticatedUser,
  ): Promise<NotficationResult[]> {
    const { limit, page } = getNotificationDto;
    const skip = (page - 1) * limit;

    const notifications = await this.prisma.notification.findMany({
      where: {
        userId: user.sub,
      },
      skip,
      take: limit,
    });

    if (!notifications.length) {
      throw new NotFoundException('notifications not found');
    }

    return notifications;
  }

  async findNotificationById(id: string): Promise<NotficationResult> {
    const notifications = await this.prisma.notification.findUnique({
      where: {
        id: id,
      },
    });

    if (!notifications) {
      throw new NotFoundException(`notification with id: ${id} not found`);
    }

    return notifications;
  }
}
