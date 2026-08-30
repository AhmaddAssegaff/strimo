import { Injectable, NotFoundException } from '@nestjs/common';
import { GetNotificationDto } from './dto/get-notifications.dto';
import { PrismaService } from '~app/infra/prisma/prisma.service';
import { SmtpService } from '~app/infra/smtp/smtp.service';
import { AuthenticatedUser } from '../auth/interface/auth.interface';
import { NotificationResult } from './interface/notification.interface';

@Injectable()
export class NotificationService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly smtp: SmtpService,
  ) {}

  async createNotificationCreatedChannel(
    user: AuthenticatedUser,
  ): Promise<NotificationResult> {
    const title = 'Congratulations! Your Channel Is Ready';
    const message = 'Thank you for creating a channel on Strimo';

    const notification = await this.prisma.notification.create({
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
  ): Promise<NotificationResult[]> {
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

  async findNotificationById(id: string): Promise<NotificationResult> {
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
