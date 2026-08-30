import { Module } from '@nestjs/common';
import { ObjectStorageModule } from '~app/infra/object-storage/object-storage.module';
import { BannerStorageService } from './banner-storage.service';
import { BannerProcessorModule } from '~app/core/processors/banner/banner-processor.module';

@Module({
  imports: [ObjectStorageModule, BannerProcessorModule],
  providers: [BannerStorageService],
  exports: [BannerStorageService],
})
export class BannerStorageModule {}
