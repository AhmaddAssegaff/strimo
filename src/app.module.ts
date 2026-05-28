import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigurationModule } from './modules/common/configuration.module';
import { DatabaseModule } from './modules/common/database.module';
import { MailModule } from './modules/common/mailer.module';
import { RedisModule } from './modules/common/redis.module';
import { QueueModule } from './modules/common/queue.module';
import { MinioModule } from './modules/common/minio.module';

@Module({
  imports: [
    ConfigurationModule,
    DatabaseModule,
    MailModule,
    RedisModule,
    QueueModule,
    MinioModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
