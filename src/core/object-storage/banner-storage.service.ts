import { Injectable } from '@nestjs/common';
import { ObjectStorageService } from './object-storage.service';
import {
  BANNER_BUCKET_NAME,
  DEFAULT_BANNER_OBJECT_KEY,
} from './object-storage.constants';
import { BannerProcessorService } from '~app/modules/channel/processor/banner.processor.service';

@Injectable()
export class BannerStorageService {
  constructor(
    private readonly objectStorage: ObjectStorageService,
    private readonly bannerProcessor: BannerProcessorService,
  ) {}

  async processAndUpload(
    channelId: string,
    file: Express.Multer.File,
  ): Promise<void> {
    const objectName = channelId;

    const processedBanner = await this.bannerProcessor.process(file.buffer);

    const webpFile: Express.Multer.File = {
      ...file,
      buffer: processedBanner,
      size: processedBanner.length,
      mimetype: 'image/webp',
      originalname: 'banner.webp',
    };

    await this.objectStorage.uploadFile(
      BANNER_BUCKET_NAME,
      objectName,
      webpFile,
    );
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
