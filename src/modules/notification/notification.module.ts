import { Module } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { NotificationController } from './notification.controller';
import { SmtpService } from '~core/smtp/smtp.service';

@Module({
  controllers: [NotificationController],
  providers: [NotificationService, SmtpService],
  exports: [NotificationService, SmtpService],
})
export class NotificationModule {}
