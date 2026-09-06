import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { BullmqModule } from './bullmq/bullmq.module';
import { ObjectStorageModule } from './object-storage/object-storage.module';
import { RedisModule } from './redis/redis.module';
import { SmtpModule } from './smtp/smtp.module';

@Module({
  imports: [
    PrismaModule,
    RedisModule,
    BullmqModule,
    ObjectStorageModule,
    SmtpModule,
  ],
  exports: [
    PrismaModule,
    RedisModule,
    BullmqModule,
    ObjectStorageModule,
    SmtpModule,
  ],
})
export class InfraModule {}
