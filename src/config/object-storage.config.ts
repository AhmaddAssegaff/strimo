import { registerAs } from '@nestjs/config';
import * as Joi from 'joi';

export const CONFIG_NAME = 's3' as const;

const objectStorageConfig = registerAs(CONFIG_NAME, () => ({
  RUSTFS_ENDPOINT: process.env.RUSTFS_ENDPOINT,
  RUSTFS_ACCESS_KEY: process.env.RUSTFS_ACCESS_KEY,
  RUSTFS_SECRET_KEY: process.env.RUSTFS_SECRET_KEY,
  RUSTFS_API_PORT: process.env.RUSTFS_API_PORT,
  RUSTFS_DASHBOARD_CONSOLE_PORT: process.env.RUSTFS_DASHBOARD_CONSOLE_PORT,
  RUSTFS_REGION: process.env.RUSTFS_REGION,
  RUSTFS_CORS_ALLOWED_ORIGINS: process.env.RUSTFS_CORS_ALLOWED_ORIGINS,
}));

type ObjectStorageConfig = ReturnType<typeof objectStorageConfig>;
type ObjectStorageKey = keyof ObjectStorageConfig;

export const ObjectStorageValidationSchema = {
  RUSTFS_ENDPOINT: Joi.string().required(),
  RUSTFS_ACCESS_KEY: Joi.string().required(),
  RUSTFS_SECRET_KEY: Joi.string().required(),
  RUSTFS_API_PORT: Joi.number().required(),
  RUSTFS_DASHBOARD_CONSOLE_PORT: Joi.number().required(),
  RUSTFS_REGION: Joi.string().required(),
  RUSTFS_CORS_ALLOWED_ORIGINS: Joi.string().uri().required(),
};

export const CONSTANTS_OBJECT_STORAGE_KEYS: {
  OBJECT_STORAGE: {
    [K in ObjectStorageKey]: `${typeof CONFIG_NAME}.${K}`;
  };
} = {
  OBJECT_STORAGE: {
    RUSTFS_ENDPOINT: 's3.RUSTFS_ENDPOINT',
    RUSTFS_ACCESS_KEY: 's3.RUSTFS_ACCESS_KEY',
    RUSTFS_SECRET_KEY: 's3.RUSTFS_SECRET_KEY',
    RUSTFS_API_PORT: 's3.RUSTFS_API_PORT',
    RUSTFS_DASHBOARD_CONSOLE_PORT: 's3.RUSTFS_DASHBOARD_CONSOLE_PORT',
    RUSTFS_REGION: 's3.RUSTFS_REGION',
    RUSTFS_CORS_ALLOWED_ORIGINS: 's3.RUSTFS_CORS_ALLOWED_ORIGINS',
  },
} as const;

export default objectStorageConfig;
