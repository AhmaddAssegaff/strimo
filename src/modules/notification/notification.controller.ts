import { Controller, Get, Param } from '@nestjs/common';
import { NotificationService } from './notification.service';

@Controller('notification')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Get()
  getAllNotifications() {
    return this.notificationService.findNotifications();
  }

  @Get(':id')
  getNotificationById(@Param('id') id: string) {
    return this.notificationService.findNotificationById(+id);
  }
}
