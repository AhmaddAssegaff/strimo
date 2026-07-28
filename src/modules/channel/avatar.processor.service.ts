import { Injectable } from '@nestjs/common';
import sharp from 'sharp';
import { FILE_RULES } from '~app/core/pipes/file-upload/file-upload.constant';

@Injectable()
export class AvatarProcessorService {
  async adjustAspectRatio(
    buffer: Buffer,
    width = FILE_RULES.avatar.minWidth,
    height = FILE_RULES.avatar.minHeight,
  ): Promise<Buffer> {
    return sharp(buffer)
      .resize({
        width,
        height,
        fit: 'cover',
        position: 'centre',
      })
      .toBuffer();
  }

  async convertToWebp(buffer: Buffer, quality = 80): Promise<Buffer> {
    return sharp(buffer).webp({ quality }).toBuffer();
  }
}
