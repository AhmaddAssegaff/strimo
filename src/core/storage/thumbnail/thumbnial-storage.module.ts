import { Module } from '@nestjs/common';
import { ObjectStorageModule } from '~app/infra/object-storage/object-storage.module';
import { ThumbailService } from './thumbnial-storage.service';

@Module({
  imports: [ObjectStorageModule],
  exports: [ThumbailService],
  providers: [ThumbailService],
})
export class thumbnailStorageModule {}
