import { Injectable } from '@nestjs/common';
import sharp from 'sharp';
import { FILE_RULES } from '~app/core/pipes/file-upload/file-upload.constant';

@Injectable()
export class AvatarProcessorService {
  async process(
    buffer: Buffer,
    minWidth = FILE_RULES.avatar.minWidth,
    minHeight = FILE_RULES.avatar.minHeight,
    quality = FILE_RULES.avatar.qualityWebp,
  ): Promise<Buffer> {
    const image = sharp(buffer);
    const metadata = await image.metadata();

    const needResize =
      metadata.width !== minWidth || metadata.height !== minHeight;

    const needConvert = metadata.format !== 'webp';

    if (!needResize && !needConvert) {
      return buffer;
    }

    let pipeline = image;

    if (needResize) {
      pipeline = pipeline.resize({
        width: minWidth,
        height: minHeight,
        fit: 'cover',
        position: 'centre',
      });
    }

    if (needConvert) {
      pipeline = pipeline.webp({ quality });
    }

    return pipeline.toBuffer();
  }
}
