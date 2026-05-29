import { Module } from '@nestjs/common';
import { AppController } from '~app/app.controller';
import { AppService } from '~app/app.service';
import { ConfigurationModule } from '~app/configuration.module';
import { TypeormModule } from '~app/core/typeorm/typeorm.module';
import { SmtpModule } from '~core/smtp/smtp.module';
import { RedisModule } from '~core/redis/redis.module';
import { BullmqModule } from '~core/bullmq/bullmq.module';
import { MinioModule } from '~core/minio/minio.module';
import { PinoModule } from '~core/pino/pino.module';

@Module({
  imports: [
    ConfigurationModule,
    TypeormModule,
    SmtpModule,
    RedisModule,
    BullmqModule,
    MinioModule,
    PinoModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
