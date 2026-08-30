import { Injectable } from '@nestjs/common';
import {
  AVATAR_BUCKET_NAME,
  DEFAULT_AVATAR_OBJECT_KEY,
} from '~app/infra/object-storage/object-storage.constants';
import { ObjectStorageService } from '~app/infra/object-storage/object-storage.service';
import { AvatarProcessorService } from '~app/core/processors/avatar/avatar-processor.service';

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
