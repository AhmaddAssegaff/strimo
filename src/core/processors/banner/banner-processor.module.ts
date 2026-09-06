import { Module } from '@nestjs/common';
import { BannerProcessorService } from './banner-processor.service';

@Module({
  providers: [BannerProcessorService],
  exports: [BannerProcessorService],
})
export class BannerProcessorModule {}
