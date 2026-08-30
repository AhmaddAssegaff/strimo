import { Module } from '@nestjs/common';
import { ProfilePictureProcessorService } from './profile-picture.processor.service';

@Module({
  providers: [ProfilePictureProcessorService],
  exports: [ProfilePictureProcessorService],
})
export class ProfilePictureProcessorModule {}
