import { ConfigFactory } from '@nestjs/config';
import * as Joi from 'joi';

import * as app from './app.config';
import * as swagger from './swagger.config';
import * as db from './database.config';
import * as smtp from './smtp.config';
import * as redis from './redis.config';
import * as minio from './minio.config';
import * as bucketMinio from './bucket-minio.config';
import * as auth from './auth.config';
import * as google from './google-oaut.config';
import * as health from './health.config';

export const configs = [
  app.default,
  swagger.default,
  db.default,
  smtp.default,
  redis.default,
  minio.default,
  bucketMinio.default,
  auth.default,
  google.default,
  health.default,
] satisfies ConfigFactory[];

export const validationSchema = Joi.object({
  ...app.appValidationSchema,
  ...swagger.swaggerValidationSchema,
  ...db.dbValidationSchema,
  ...smtp.SmtpValidationSchema,
  ...redis.RedisValidationSchema,
  ...minio.MinioValidationSchema,
  ...bucketMinio.BucketsMinioValidationSchema,
  ...auth.AuthValidationSchema,
  ...google.GoogleValidationSchema,
  ...health.HealthValidationSchema,
});

export const CONSTANTS = {
  ...app.CONSTANTS_APP_KEYS,
  ...swagger.CONSTANTS_SWAGGER_KEYS,
  ...db.CONSTANTS_DB_KEYS,
  ...smtp.CONSTANTS_SMTP_KEYS,
  ...redis.CONSTANTS_REDIS_KEYS,
  ...minio.CONSTANTS_MINIO_KEYS,
  ...bucketMinio.CONSTANTS_BUCKETS_MINIO_KEYS,
  ...auth.CONSTANTS_AUTH_KEYS,
  ...google.CONSTANTS_GOOGLE_KEYS,
  ...health.CONSTANTS_HEALTH_KEYS,
} as const;

export default configs;
