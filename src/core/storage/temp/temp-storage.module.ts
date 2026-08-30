import { Module } from '@nestjs/common';
import { ObjectStorageModule } from '~app/infra/object-storage/object-storage.module';
import { TempStorageService } from './temp-storage.service';

@Module({
  imports: [ObjectStorageModule],
  exports: [TempStorageService],
  providers: [TempStorageService],
})
export class TempStorageModule {}
