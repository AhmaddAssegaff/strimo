import { Injectable } from '@nestjs/common';
import { ObjectStorageService } from './object-storage.service';
import {
  BANNER_BUCKET_NAME,
  DEFAULT_BANNER_OBJECT_KEY,
} from './object-storage.constants';
import { BannerProcessorService } from '~app/modules/channel/banner.processor.service';

@Injectable()
export class BannerStorageService {
  constructor(
    private readonly objectStorage: ObjectStorageService,
    private readonly bannerProcessor: BannerProcessorService,
  ) {}

  async processAndUpload(
    userId: string,
    file: Express.Multer.File,
  ): Promise<{ objectName: string; presignedUrl: string }> {
    const resizedBuffer = await this.bannerProcessor.adjustAspectRatio(
      file.buffer,
    );
    const webpBuffer = await this.bannerProcessor.convertToWebp(resizedBuffer);
    const webpFile: Express.Multer.File = {
      ...file,
      buffer: webpBuffer,
      size: webpBuffer.length,
      mimetype: 'image/webp',
      originalname: 'banner.webp',
    };
    const objectName = userId;

    await this.objectStorage.uploadFile(
      BANNER_BUCKET_NAME,
      objectName,
      webpFile,
    );

    const presignedUrl = await this.objectStorage.getFileUrl(
      BANNER_BUCKET_NAME,
      objectName,
    );

    return { objectName, presignedUrl };
  }

  async getBannerUrl(objectName: string): Promise<string> {
    return this.objectStorage.getFileUrl(BANNER_BUCKET_NAME, objectName);
  }

  async deleteBanner(objectName: string): Promise<void> {
    if (!objectName) return;
    await this.objectStorage.deleteFile(BANNER_BUCKET_NAME, objectName);
  }

  getDefaultKey(): string {
    return DEFAULT_BANNER_OBJECT_KEY;
  }
}
