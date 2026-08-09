import { Injectable } from '@nestjs/common';
import { ObjectStorageService } from './object-storage.service';
import { TEMP_BUCKET_NAME } from './object-storage.constants';

@Injectable()
export class VideoStorageService {
  constructor(private readonly objectStorage: ObjectStorageService) {}

  async initiateUpload(uploadId: string, mimeType: string) {
    const objectKey = `uploads/${uploadId}/source`;

    const multipartUploadId = await this.objectStorage.initiateMultipartUpload(
      TEMP_BUCKET_NAME,
      objectKey,
      mimeType,
    );

    return {
      bucket: TEMP_BUCKET_NAME,
      objectKey,
      multipartUploadId,
    };
  }

  async getChunkPresignedUrl() {}

  async resumeUpload() {}

  async recordChunkSuccess() {}

  async completeUpload() {}

  async abortUpload() {}
}
