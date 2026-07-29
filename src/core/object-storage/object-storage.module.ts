import { Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CONSTANTS } from '~config/index';
import { OBJECT_STORAGE_TOKEN } from '~app/core/object-storage/object-storage.constants';
import { ObjectStorageService } from './object-storage.service';
import { S3Client } from '@aws-sdk/client-s3';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: OBJECT_STORAGE_TOKEN,
      inject: [ConfigService],
      useFactory: (config: ConfigService): S3Client => {
        const endpoint = config.getOrThrow<string>(
          CONSTANTS.OBJECT_STORAGE.RUSTFS_ENDPOINT,
        );
        const accessKey = config.getOrThrow<string>(
          CONSTANTS.OBJECT_STORAGE.RUSTFS_ACCESS_KEY,
        );
        const secretKey = config.getOrThrow<string>(
          CONSTANTS.OBJECT_STORAGE.RUSTFS_SECRET_KEY,
        );
        const port = config.getOrThrow<number>(
          CONSTANTS.OBJECT_STORAGE.RUSTFS_API_PORT,
        );
        const region = config.getOrThrow<string>(
          CONSTANTS.OBJECT_STORAGE.RUSTFS_REGION,
        );

        return new S3Client({
          endpoint: `http://${endpoint}:${port}`,
          region: region,
          credentials: {
            accessKeyId: accessKey,
            secretAccessKey: secretKey,
          },
          forcePathStyle: true,
        });
      },
    },
    ObjectStorageService,
  ],
  exports: [OBJECT_STORAGE_TOKEN, ObjectStorageService],
})
export class ObjectStorageModule {}
