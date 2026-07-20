import { Module } from '@nestjs/common';
import { MailerModule } from '@nestjs-modules/mailer';
import { CONSTANTS } from '~config/index';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    MailerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        transport: {
          pool: true,
          host: config.getOrThrow<string>(CONSTANTS.SMTP.SMTP_HOST),
          port: config.getOrThrow<number>(CONSTANTS.SMTP.SMTP_PORT),
          auth: {
            user: config.getOrThrow<string>(CONSTANTS.SMTP.SMTP_USER),
            pass: config.getOrThrow<string>(CONSTANTS.SMTP.SMTP_PASS),
          },
          secure: false,
          tls: {
            rejectUnauthorized: true,
          },
        },
        defaults: {
          from: config.getOrThrow<string>(CONSTANTS.SMTP.SMTP_FROM),
        },
      }),
    }),
  ],
})
export class SmtpModule {}
