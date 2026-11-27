import { Module } from '@nestjs/common';
import { ObjectStorageModule } from '~app/infra/object-storage/object-storage.module';
import { ThumbailService } from './thumbnail-storage.service';

@Module({
  imports: [ObjectStorageModule],
  exports: [ThumbailService],
  providers: [ThumbailService],
})
export class ThumbnailStorageModule {}
