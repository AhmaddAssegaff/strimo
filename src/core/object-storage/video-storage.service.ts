import { Injectable } from '@nestjs/common';
import { ObjectStorageService } from '~app/core/object-storage/object-storage.service';
import { TEMP_BUCKET_NAME } from '~app/core/object-storage/object-storage.constants';
import { CompletedPart } from '@aws-sdk/client-s3';

@Injectable()
export class VideoStorageService {
  constructor(private readonly objectStorage: ObjectStorageService) {}

  calculateChunkSize(sizeBytes: number): number {
    const MB = 1024 * 1024;
    const GB = 1024 * MB;

    if (sizeBytes <= 100 * MB) return 8 * MB;
    if (sizeBytes <= 1 * GB) return 64 * MB;
    if (sizeBytes <= 10 * GB) return 128 * MB;
    if (sizeBytes <= 100 * GB) return 256 * MB;
    return 512 * MB;
  }

  async initiateUpload(uploadId: string, mimeType: string) {
    const objectKey = uploadId;

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

  async getChunkPresignedUrl(
    objectKey: string,
    multipartUploadId: string,
    partNumber: number,
  ) {
    const url = await this.objectStorage.getPresignedUploadPartUrl(
      TEMP_BUCKET_NAME,
      objectKey,
      multipartUploadId,
      partNumber,
    );

    return {
      bucket: TEMP_BUCKET_NAME,
      objectKey,
      multipartUploadId,
      partNumber,
      url,
    };
  }

  async getChunkPresignedUrls(
    objectKey: string,
    multipartUploadId: string,
    totalParts: number,
  ) {
    const parts = await this.objectStorage.getPresignedUploadPartUrls(
      TEMP_BUCKET_NAME,
      objectKey,
      multipartUploadId,
      totalParts,
    );

    return {
      bucket: TEMP_BUCKET_NAME,
      objectKey,
      multipartUploadId,
      parts,
    };
  }

  async completeUpload(
    objectKey: string,
    multipartUploadId: string,
    parts: CompletedPart[],
  ) {
    await this.objectStorage.completeMultipartUpload(
      TEMP_BUCKET_NAME,
      objectKey,
      multipartUploadId,
      parts,
    );
  }

  async abortUpload(objectKey: string, multipartUploadId: string) {
    await this.objectStorage.abortMultipartUpload(
      TEMP_BUCKET_NAME,
      objectKey,
      multipartUploadId,
    );
  }
}
