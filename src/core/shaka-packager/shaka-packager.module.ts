import { Module } from '@nestjs/common';
import { ShakaPackagerService } from './shaka-packager.service';

@Module({
  providers: [ShakaPackagerService],
  exports: [ShakaPackagerService],
})
export class ShakaPackagerModule {}
