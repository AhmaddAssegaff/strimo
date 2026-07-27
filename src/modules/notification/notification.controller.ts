import {
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Query,
  UseGuards,
} from '@nestjs/common';
import { NotificationService } from './notification.service';
import { GetNotificationDto } from './dto/get-notifications.dto';
import { JwtAccessGuard } from '../auth/guard/jwt-access.guard';
import { CurrentUser } from '~app/core/decorators/current-user.decorators';
import type { AuthenticatedUser } from '../auth/interface/auth.interface';

@UseGuards(JwtAccessGuard)
@Controller('notification')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Get()
  getAllNotifications(
    @Query() getNotificationDto: GetNotificationDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.notificationService.findNotifications(getNotificationDto, user);
  }

  @Get(':notificationId')
  getNotificationById(
    @Param('notificationId', ParseUUIDPipe) notificationId: string,
  ) {
    return this.notificationService.findNotificationById(notificationId);
  }
}
