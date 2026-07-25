import { Module } from '@nestjs/common';
import { AppController } from '~app/app.controller';
import { AppService } from '~app/app.service';
import { ConfigurationModule } from '~app/configuration.module';
import { SmtpModule } from '~core/smtp/smtp.module';
import { RedisModule } from '~core/redis/redis.module';
import { BullmqModule } from '~core/bullmq/bullmq.module';
import { MinioModule } from '~core/minio/minio.module';
import { PinoModule } from '~core/pino/pino.module';
import { PrismaModule } from './core/prisma/prisma.module';
import { HealthModule } from '~app/health/health.module';
import { RouterModule } from '~modules/router.module';

@Module({
  imports: [
    ConfigurationModule,
    SmtpModule,
    RedisModule,
    BullmqModule,
    MinioModule,
    PinoModule,
    PrismaModule,
    HealthModule,
    RouterModule.forRoot(),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
