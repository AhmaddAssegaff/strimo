import { Injectable } from '@nestjs/common';
import sharp from 'sharp';
import { FILE_RULES } from '~app/core/pipes/file-upload/file-upload.constant';

@Injectable()
export class BannerProcessorService {
  async process(
    buffer: Buffer,
    targetWidth = FILE_RULES.banner.targetWidth,
    targetHeight = FILE_RULES.banner.targetHeight,
    quality = FILE_RULES.banner.qualityWebp,
  ): Promise<Buffer> {
    const image = sharp(buffer);
    const metadata = await image.metadata();

    const needResize =
      metadata.width !== targetWidth || metadata.height !== targetHeight;

    const needConvert = metadata.format !== 'webp';

    if (!needResize && !needConvert) {
      return buffer;
    }

    let pipeline = image;

    if (needResize) {
      pipeline = pipeline.resize({
        width: targetWidth,
        height: targetHeight,
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
