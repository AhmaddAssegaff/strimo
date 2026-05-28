import { Module } from '@nestjs/common';
import { AppController } from '~app/app.controller';
import { AppService } from '~app/app.service';
import { ConfigurationModule } from '~app/configuration.module';
import { PostgresModule } from '~core/postgres/postgres.module';
import { SmtpModule } from '~core/smtp/smtp.module';
import { RedisModule } from '~core/redis/redis.module';
import { BullmqModule } from '~core/bullmq/bullmq.module';
import { MinioModule } from '~core/minio/minio.module';

@Module({
  imports: [
    ConfigurationModule,
    PostgresModule,
    SmtpModule,
    RedisModule,
    BullmqModule,
    MinioModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
