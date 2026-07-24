import { Inject, Injectable } from '@nestjs/common';
import * as Minio from 'minio';
import { MINIO_TOKEN } from './minio.constants';

@Injectable()
export class MinioService {
  constructor(
    @Inject(MINIO_TOKEN) private readonly minioClient: Minio.Client,
  ) {}

  private async ensureBucket(bucketName: string): Promise<void> {
    const exists = await this.minioClient.bucketExists(bucketName);
    if (!exists) {
      await this.minioClient.makeBucket(bucketName);
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
