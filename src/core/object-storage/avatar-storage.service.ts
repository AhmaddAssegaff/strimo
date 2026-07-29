import { Injectable } from '@nestjs/common';
import { ObjectStorageService } from './object-storage.service';
import {
  AVATAR_BUCKET_NAME,
  DEFAULT_AVATAR_OBJECT_KEY,
} from './object-storage.constants';
import { AvatarProcessorService } from '~app/modules/channel/avatar.processor.service';

@Injectable()
export class AvatarStorageService {
  constructor(
    private readonly objectStorage: ObjectStorageService,
    private readonly avatarProcessor: AvatarProcessorService,
  ) {}

  async processAndUpload(
    userId: string,
    file: Express.Multer.File,
  ): Promise<{ objectName: string; presignedUrl: string }> {
    const resizedBuffer = await this.avatarProcessor.adjustAspectRatio(
      file.buffer,
    );
    const webpBuffer = await this.avatarProcessor.convertToWebp(resizedBuffer);
    const webpFile: Express.Multer.File = {
      ...file,
      buffer: webpBuffer,
      size: webpBuffer.length,
      mimetype: 'image/webp',
      originalname: 'avatar.webp',
    };
    const objectName = userId;

    await this.objectStorage.uploadFile(
      AVATAR_BUCKET_NAME,
      objectName,
      webpFile,
    );

    const presignedUrl = await this.objectStorage.getFileUrl(
      AVATAR_BUCKET_NAME,
      objectName,
    );

    return { objectName, presignedUrl };
  }

  async getAvatarUrl(objectName: string): Promise<string> {
    return this.objectStorage.getFileUrl(AVATAR_BUCKET_NAME, objectName);
  }

  async deleteAvatar(objectName: string): Promise<void> {
    if (!objectName) return;
    await this.objectStorage.deleteFile(AVATAR_BUCKET_NAME, objectName);
  }

  getDefaultKey(): string {
    return DEFAULT_AVATAR_OBJECT_KEY;
  }
}
