import { registerAs } from '@nestjs/config';
import * as Joi from 'joi';

export const CONFIG_NAME = 'buckets-minio' as const;

const bucketsMinioConfig = registerAs(CONFIG_NAME, () => ({
  MINIO_USER_PROFILE_BUCKET_NAME: process.env.MINIO_USER_PROFILE_BUCKET_NAME,
}));

type BucketsMinioConfig = ReturnType<typeof bucketsMinioConfig>;
type BucketsMinioKey = keyof BucketsMinioConfig;

export const BucketsMinioValidationSchema = {
  MINIO_USER_PROFILE_BUCKET_NAME: Joi.string().required(),
};

export const CONSTANTS_BUCKETS_MINIO_KEYS: {
  BUCKETS_MINIO: {
    [K in BucketsMinioKey]: `${typeof CONFIG_NAME}.${K}`;
  };
} = {
  BUCKETS_MINIO: {
    MINIO_USER_PROFILE_BUCKET_NAME:
      'buckets-minio.MINIO_USER_PROFILE_BUCKET_NAME',
  },
} as const;

export default bucketsMinioConfig;
