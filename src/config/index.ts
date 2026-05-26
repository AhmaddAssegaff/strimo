import { ConfigFactory } from '@nestjs/config';
import * as Joi from 'joi';

import * as app from './app.config';
import * as swagger from './swagger.config';
import * as db from './database.config';
import * as typeOrm from './typeorm.config';

export const configs = [
  app.default,
  swagger.default,
  db.default,
  typeOrm.default,
] satisfies ConfigFactory[];

export const validationSchema = Joi.object({
  ...app.appValidationSchema,
  ...swagger.swaggerValidationSchema,
  ...db.dbValidationSchema,
  ...typeOrm.TypeOrmValidationSchema,
});

export const CONSTANTS = {
  ...app.CONSTANTS_APP_KEYS,
  ...swagger.CONSTANTS_SWAGGER_KEYS,
  ...db.CONSTANTS_DB_KEYS,
  ...typeOrm.CONSTANTS_TYPEORM_KEYS,
} as const;

export default configs;
