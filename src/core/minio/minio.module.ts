import { Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Client } from 'minio';
import { CONSTANTS } from '~config/index';
import { MINIO_TOKEN } from '~minio/minio.constants';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: MINIO_TOKEN,
      inject: [ConfigService],
      useFactory: (config: ConfigService): Client => {
        return new Client({
          endPoint: config.getOrThrow<string>(CONSTANTS.MINIO.MINIO_ENDPOINT),
          port: config.getOrThrow<number>(CONSTANTS.MINIO.MINIO_API_PORT),
          accessKey: config.getOrThrow<string>(
            CONSTANTS.MINIO.MINIO_ACCESS_KEY,
          ),
          secretKey: config.getOrThrow<string>(
            CONSTANTS.MINIO.MINIO_SECRET_KEY,
          ),
          useSSL: false,
        });
      },
    },
  ],
  exports: [MINIO_TOKEN],
})
export class MinioModule {}
