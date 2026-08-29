import { Injectable } from '@nestjs/common';
import { ObjectStorageService } from './object-storage.service';
import {
  AVATAR_BUCKET_NAME,
  DEFAULT_AVATAR_OBJECT_KEY,
} from './object-storage.constants';
import { AvatarProcessorService } from '~app/modules/channel/processor/avatar.processor.service';

@Injectable()
export class AvatarStorageService {
  constructor(
    private readonly objectStorage: ObjectStorageService,
    private readonly avatarProcessor: AvatarProcessorService,
  ) {}

  async processAndUpload(
    channelId: string,
    file: Express.Multer.File,
  ): Promise<void> {
    const objectName = channelId;

    const processedAvatar = await this.avatarProcessor.process(file.buffer);

    const webpFile: Express.Multer.File = {
      ...file,
      buffer: processedAvatar,
      size: processedAvatar.length,
      mimetype: 'image/webp',
    };

    await this.objectStorage.uploadFile(
      AVATAR_BUCKET_NAME,
      objectName,
      webpFile,
    );
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
