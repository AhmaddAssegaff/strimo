import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import * as Minio from 'minio';
import * as path from 'path';
import {
  MINIO_TOKEN,
  AVATAR_BUCKET_NAME,
  BANNER_BUCKET_NAME,
  DEFAULT_AVATAR_LOCAL_PATH,
  DEFAULT_BANNER_LOCAL_PATH,
  DEFAULT_AVATAR_OBJECT_KEY,
  DEFAULT_BANNER_OBJECT_KEY,
} from './minio.constants';
import { PinoLogger } from 'nestjs-pino';

@Injectable()
export class MinioService implements OnModuleInit {
  constructor(
    @Inject(MINIO_TOKEN) private readonly minioClient: Minio.Client,
    private readonly logger: PinoLogger,
  ) {}

  private async ensureBucket(bucketName: string): Promise<void> {
    const exists = await this.minioClient.bucketExists(bucketName);
    if (!exists) {
      await this.minioClient.makeBucket(bucketName);
    }
  }

  private async isObjectExists(
    bucket: string,
    object: string,
  ): Promise<boolean> {
    try {
      await this.minioClient.statObject(bucket, object);
      return true;
    } catch {
      return false;
    }
  }

  private async ensureDefaultObject(
    bucketName: string,
    objectName: string,
    localFilePath: string,
  ): Promise<void> {
    await this.ensureBucket(bucketName);

    const exists = await this.isObjectExists(bucketName, objectName);
    if (!exists) {
      await this.minioClient.fPutObject(bucketName, objectName, localFilePath, {
        'Content-Type': 'image/png',
      });
    }
  }

  async onModuleInit() {
    try {
      await this.ping();
      const avatarPath = path.join(process.cwd(), DEFAULT_AVATAR_LOCAL_PATH);
      const bannerPath = path.join(process.cwd(), DEFAULT_BANNER_LOCAL_PATH);

      await this.ensureDefaultObject(
        AVATAR_BUCKET_NAME,
        DEFAULT_AVATAR_OBJECT_KEY,
        avatarPath,
      );

      await this.ensureDefaultObject(
        BANNER_BUCKET_NAME,
        DEFAULT_BANNER_OBJECT_KEY,
        bannerPath,
      );

      this.logger.info('Default MinIO objects initialized');
    } catch {
      this.logger.warn(
        'MinIO is unavailable. Default objects were not initialized.',
      );
    }
  }

  async ping(): Promise<void> {
    await this.minioClient.listBuckets();
  }

  async uploadFile(
    bucketName: string,
    objectName: string,
    file: Express.Multer.File,
  ): Promise<string> {
    await this.ensureBucket(bucketName);

    await this.minioClient.putObject(
      bucketName,
      objectName,
      file.buffer,
      file.buffer.length,
      {
        'Content-Type': file.mimetype,
      },
    );

    return objectName;
  }

  async getFileUrl(
    bucketName: string,
    objectName: string,
    expirySeconds = 3600,
  ): Promise<string> {
    return await this.minioClient.presignedGetObject(
      bucketName,
      objectName,
      expirySeconds,
    );
  }

  async deleteFile(bucketName: string, objectName: string): Promise<void> {
    await this.minioClient.removeObject(bucketName, objectName);
  }
}
