import { Injectable } from '@nestjs/common';
import { ObjectStorageService } from './object-storage.service';
import { PROFILE_PICTURE_BUCKET_NAME } from './object-storage.constants';
import { ProfilePictureProcessorService } from '~app/modules/user/processor/profile-picture.processor.service';

@Injectable()
export class ProfilePictureStorageService {
  constructor(
    private readonly objectStorage: ObjectStorageService,
    private readonly profilePictureProcessor: ProfilePictureProcessorService,
  ) {}

  async processAndUpload(
    userId: string,
    file: Express.Multer.File,
  ): Promise<{ objectName: string; presignedUrl: string }> {
    const resizedBuffer = await this.profilePictureProcessor.adjustAspectRatio(
      file.buffer,
    );
    const webpBuffer =
      await this.profilePictureProcessor.convertToWebp(resizedBuffer);
    const webpFile: Express.Multer.File = {
      ...file,
      buffer: webpBuffer,
      size: webpBuffer.length,
      mimetype: 'image/webp',
      originalname: 'profile.webp',
    };
    const objectName = userId;

    await this.objectStorage.uploadFile(
      PROFILE_PICTURE_BUCKET_NAME,
      objectName,
      webpFile,
    );

    const presignedUrl = await this.objectStorage.getFileUrl(
      PROFILE_PICTURE_BUCKET_NAME,
      objectName,
    );

    return { objectName, presignedUrl };
  }

  async getProfilePictureUrl(objectName: string): Promise<string> {
    return this.objectStorage.getFileUrl(
      PROFILE_PICTURE_BUCKET_NAME,
      objectName,
    );
  }

  async deleteProfilePicture(objectName: string): Promise<void> {
    if (!objectName) return;
    await this.objectStorage.deleteFile(
      PROFILE_PICTURE_BUCKET_NAME,
      objectName,
    );
  }
}
