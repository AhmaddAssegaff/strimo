import { Injectable } from '@nestjs/common';
import { CreateNotificationDto } from './dto/create-notification.dto';
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

  findNotifications() {
    return `This action returns all notification`;
  }

  findNotificationById(id: number) {
    return `This action returns a #${id} notification`;
  }
}
