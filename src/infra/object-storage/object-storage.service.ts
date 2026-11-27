import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import * as path from 'path';
import {
  OBJECT_STORAGE_TOKEN,
  AVATAR_BUCKET_NAME,
  BANNER_BUCKET_NAME,
  DEFAULT_AVATAR_LOCAL_PATH,
  DEFAULT_BANNER_LOCAL_PATH,
  DEFAULT_AVATAR_OBJECT_KEY,
  DEFAULT_BANNER_OBJECT_KEY,
} from './object-storage.constants';
import { PinoLogger } from 'nestjs-pino';
import { readFile } from 'node:fs/promises';
import {
  AbortMultipartUploadCommand,
  CompletedPart,
  CompleteMultipartUploadCommand,
  CreateBucketCommand,
  CreateMultipartUploadCommand,
  DeleteObjectCommand,
  HeadBucketCommand,
  HeadObjectCommand,
  ListBucketsCommand,
  ListObjectsV2Command,
  PutObjectCommand,
  S3Client,
  UploadPartCommand,
  GetObjectCommand,
  DeleteObjectsCommand,
  type ObjectIdentifier,
} from '@aws-sdk/client-s3';
import { createReadStream } from 'node:fs';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

@Injectable()
export class ObjectStorageService implements OnModuleInit {
  constructor(
    @Inject(OBJECT_STORAGE_TOKEN) private readonly s3Client: S3Client,
    private readonly logger: PinoLogger,
  ) {}

  private async ensureBucket(bucketName: string): Promise<void> {
    try {
      await this.s3Client.send(
        new HeadBucketCommand({
          Bucket: bucketName,
        }),
      );
    } catch {
      await this.s3Client.send(
        new CreateBucketCommand({
          Bucket: bucketName,
        }),
      );
    }
  }

  private async isObjectExists(
    bucketName: string,
    objectName: string,
  ): Promise<boolean> {
    try {
      await this.s3Client.send(
        new HeadObjectCommand({
          Bucket: bucketName,
          Key: objectName,
        }),
      );
      return true;
    } catch {
      return false;
    }
  }

  private async ensureDefaultObject(
    bucketName: string,
    objectName: string,
    localFilePath: string,
  ): Promise<boolean> {
    await this.ensureBucket(bucketName);
    const exists = await this.isObjectExists(bucketName, objectName);
    if (exists) {
      return false;
    }
    const fileBuffer = await readFile(localFilePath);
    await this.s3Client.send(
      new PutObjectCommand({
        Bucket: bucketName,
        Key: objectName,
        Body: fileBuffer,
        ContentType: 'image/png',
      }),
    );
    return true;
  }

  async uploadGeneratedThumnail(params: {
    bucketName: string;
    objectName: string;
    localFilePath: string;
  }): Promise<boolean> {
    await this.ensureBucket(params.bucketName);

    const fileBuffer = await readFile(params.localFilePath);
    await this.s3Client.send(
      new PutObjectCommand({
        Bucket: params.bucketName,
        Key: params.objectName,
        Body: fileBuffer,
        ContentType: 'image/png',
      }),
    );
    return true;
  }

  async onModuleInit(): Promise<void> {
    try {
      await this.ping();
      const avatarPath = path.join(process.cwd(), DEFAULT_AVATAR_LOCAL_PATH);
      const bannerPath = path.join(process.cwd(), DEFAULT_BANNER_LOCAL_PATH);
      const avatarCreated = await this.ensureDefaultObject(
        AVATAR_BUCKET_NAME,
        DEFAULT_AVATAR_OBJECT_KEY,
        avatarPath,
      );
      const bannerCreated = await this.ensureDefaultObject(
        BANNER_BUCKET_NAME,
        DEFAULT_BANNER_OBJECT_KEY,
        bannerPath,
      );
      if (avatarCreated || bannerCreated) {
        this.logger.info('Default object storage objects initialized');
      }
    } catch {
      this.logger.warn(
        'Object storage is unavailable. Default objects were not initialized.',
      );
    }
  }

  async ping(): Promise<void> {
    await this.s3Client.send(new ListBucketsCommand({}));
  }

  async uploadFile(
    bucketName: string,
    objectName: string,
    file: Express.Multer.File,
  ): Promise<string> {
    await this.ensureBucket(bucketName);
    await this.s3Client.send(
      new PutObjectCommand({
        Bucket: bucketName,
        Key: objectName,
        Body: file.buffer,
        ContentLength: file.buffer.length,
        ContentType: file.mimetype,
      }),
    );
    return objectName;
  }

  async getFileUrl(
    bucketName: string,
    objectName: string,
    expirySeconds = 3600,
  ): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: bucketName,
      Key: objectName,
    });
    return getSignedUrl(this.s3Client, command, {
      expiresIn: expirySeconds,
    });
  }

  async deleteFile(bucketName: string, objectName: string): Promise<void> {
    await this.s3Client.send(
      new DeleteObjectCommand({
        Bucket: bucketName,
        Key: objectName,
      }),
    );
  }

  async initiateMultipartUpload(
    bucketName: string,
    objectName: string,
    contentType: string,
  ): Promise<string> {
    await this.ensureBucket(bucketName);
    const command = new CreateMultipartUploadCommand({
      Bucket: bucketName,
      Key: objectName,
      ContentType: contentType,
      ChecksumAlgorithm: 'SHA256',
    });
    const result = await this.s3Client.send(command);

    if (!result.UploadId) {
      throw new Error('Failed to initiate multipart upload');
    }
    return result.UploadId;
  }

  async getPresignedUploadPartUrl(
    bucketName: string,
    objectName: string,
    multipartUploadId: string,
    partNumber: number,
    expirySeconds = 3600,
  ): Promise<string> {
    const command = new UploadPartCommand({
      Bucket: bucketName,
      Key: objectName,
      UploadId: multipartUploadId,
      PartNumber: partNumber,
    });

    return getSignedUrl(this.s3Client, command, {
      expiresIn: expirySeconds,
    });
  }

  async getPresignedUploadPartUrls(
    bucketName: string,
    objectName: string,
    uploadId: string,
    totalParts: number,
    expirySeconds = 3600,
  ): Promise<{ partNumber: number; url: string }[]> {
    const urls = await Promise.all(
      Array.from({ length: totalParts }, async (_, index) => {
        const partNumber = index + 1;
        const url = await this.getPresignedUploadPartUrl(
          bucketName,
          objectName,
          uploadId,
          partNumber,
          expirySeconds,
        );
        return {
          partNumber,
          url,
        };
      }),
    );
    return urls;
  }

  async completeMultipartUpload(
    bucketName: string,
    objectName: string,
    multipartUploadId: string,
    parts: CompletedPart[],
  ): Promise<void> {
    await this.s3Client.send(
      new CompleteMultipartUploadCommand({
        Bucket: bucketName,
        Key: objectName,
        UploadId: multipartUploadId,
        MultipartUpload: {
          Parts: parts.sort(
            (a, b) => (a.PartNumber ?? 0) - (b.PartNumber ?? 0),
          ),
        },
      }),
    );
  }

  async abortMultipartUpload(
    bucketName: string,
    objectName: string,
    uploadId: string,
  ): Promise<void> {
    await this.s3Client.send(
      new AbortMultipartUploadCommand({
        Bucket: bucketName,
        Key: objectName,
        UploadId: uploadId,
      }),
    );
  }

  async uploadVideoPacked(params: {
    bucketName: string;
    objectKey: string;
    filePath: string;
    contentType: string;
  }) {
    await this.ensureBucket(params.bucketName);
    return this.s3Client.send(
      new PutObjectCommand({
        Bucket: params.bucketName,
        Key: params.objectKey,
        Body: createReadStream(params.filePath),
        ContentType: params.contentType,
      }),
    );
  }

  async listObject(params: { bucketName: string }) {
    return await this.s3Client.send(
      new ListObjectsV2Command({
        Bucket: params.bucketName,
      }),
    );
  }

  async deleteObjects(params: {
    bucketName: string;
    objectList: ObjectIdentifier[];
  }) {
    return this.s3Client.send(
      new DeleteObjectsCommand({
        Bucket: params.bucketName,
        Delete: {
          Objects: params.objectList,
        },
      }),
    );
  }
}
