import { Module } from '@nestjs/common';
import { AppController } from '~app/app.controller';
import { AppService } from '~app/app.service';
import { ConfigurationModule } from '~app/configuration.module';
import { SmtpModule } from '~core/smtp/smtp.module';
import { RedisModule } from '~core/redis/redis.module';
import { BullmqModule } from '~core/bullmq/bullmq.module';
import { MinioModule } from '~core/minio/minio.module';
import { PinoModule } from '~core/pino/pino.module';
import { UserModule } from '~modules/user/user.module';
import { AuthModule } from '~modules/auth/auth.module';
import { PrismaModule } from './core/prisma/prisma.module';

@Module({
  imports: [
    ConfigurationModule,
    SmtpModule,
    RedisModule,
    BullmqModule,
    MinioModule,
    PinoModule,
    UserModule,
    AuthModule,
    PrismaModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
