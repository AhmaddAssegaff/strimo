import { Injectable } from '@nestjs/common';
import { THUMBNAIL_VIDEO_BUCKET_NAME } from '~app/infra/object-storage/object-storage.constants';
import { ObjectStorageService } from '~app/infra/object-storage/object-storage.service';

@Injectable()
export class ThumbailService {
  constructor(private readonly objectStorage: ObjectStorageService) {}

  async uploadGeneratedThumbnail(localFilePath: string) {
    await this.objectStorage.uploadGeneratedThumnail({
      bucketName: THUMBNAIL_VIDEO_BUCKET_NAME,
      localFilePath: localFilePath,
      objectName: 'default',
    });
  }
}
