import { ConfigFactory } from '@nestjs/config';
import * as Joi from 'joi';

import * as app from './app.config';
import * as db from './database.config';
import * as smtp from './smtp.config';
import * as redis from './redis.config';
import * as s3Client from './object-storage.config';
import * as auth from './auth.config';
import * as google from './google-oaut.config';
import * as health from './health.config';

export const configs = [
  app.default,
  db.default,
  smtp.default,
  redis.default,
  s3Client.default,
  auth.default,
  google.default,
  health.default,
] satisfies ConfigFactory[];

export const validationSchema = Joi.object({
  ...app.appValidationSchema,
  ...db.dbValidationSchema,
  ...smtp.SmtpValidationSchema,
  ...redis.RedisValidationSchema,
  ...s3Client.ObjectStorageValidationSchema,
  ...auth.AuthValidationSchema,
  ...google.GoogleValidationSchema,
  ...health.HealthValidationSchema,
});

export const CONSTANTS = {
  ...app.CONSTANTS_APP_KEYS,
  ...db.CONSTANTS_DB_KEYS,
  ...smtp.CONSTANTS_SMTP_KEYS,
  ...redis.CONSTANTS_REDIS_KEYS,
  ...s3Client.CONSTANTS_OBJECT_STORAGE_KEYS,
  ...auth.CONSTANTS_AUTH_KEYS,
  ...google.CONSTANTS_GOOGLE_KEYS,
  ...health.CONSTANTS_HEALTH_KEYS,
} as const;

export default configs;
