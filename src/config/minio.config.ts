import { registerAs } from '@nestjs/config';
import * as Joi from 'joi';

export const CONFIG_NAME = 'minio' as const;

const minioConfig = registerAs(CONFIG_NAME, () => ({
  MINIO_ENDPOINT: process.env.MINIO_ENDPOINT,
  MINIO_ROOT_USER: process.env.MINIO_ROOT_USER,
  MINIO_ROOT_PASSWORD: process.env.MINIO_ROOT_PASSWORD,
  MINIO_API_PORT: process.env.MINIO_API_PORT,
  MINIO_DASHBOARD_CONSOLE_PORT: process.env.MINIO_DASHBOARD_CONSOLE_PORT,
  MINIO_ACCESS_KEY: process.env.MINIO_ACCESS_KEY,
  MINIO_SECRET_KEY: process.env.MINIO_SECRET_KEY,
}));

type MinioConfig = ReturnType<typeof minioConfig>;
type MinioKey = keyof MinioConfig;

export const MinioValidationSchema = {
  MINIO_ROOT_USER: Joi.string().required(),
  MINIO_ROOT_PASSWORD: Joi.string().required(),
  MINIO_API_PORT: Joi.number().required(),
  MINIO_DASHBOARD_CONSOLE_PORT: Joi.number().required(),
  MINIO_ACCESS_KEY: Joi.string().required(),
  MINIO_SECRET_KEY: Joi.string().required(),
};

export const CONSTANTS_MINIO_KEYS: {
  MINIO: {
    [K in MinioKey]: `${typeof CONFIG_NAME}.${K}`;
  };
} = {
  MINIO: {
    MINIO_ENDPOINT: 'minio.MINIO_ENDPOINT',
    MINIO_ROOT_USER: 'minio.MINIO_ROOT_USER',
    MINIO_ROOT_PASSWORD: 'minio.MINIO_ROOT_PASSWORD',
    MINIO_API_PORT: 'minio.MINIO_API_PORT',
    MINIO_DASHBOARD_CONSOLE_PORT: 'minio.MINIO_DASHBOARD_CONSOLE_PORT',
    MINIO_ACCESS_KEY: 'minio.MINIO_ACCESS_KEY',
    MINIO_SECRET_KEY: 'minio.MINIO_SECRET_KEY',
  },
} as const;

export default minioConfig;
