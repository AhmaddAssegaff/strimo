import { ConfigFactory } from '@nestjs/config';
import * as Joi from 'joi';

import * as app from './app.config';
import * as swagger from './swagger.config';

export const configs = [app.default, swagger.default] satisfies ConfigFactory[];

export const validationSchema = Joi.object({
  ...app.appValidationSchema,
  ...swagger.swaggerValidationSchema,
});

export const CONSTANTS = {
  ...app.CONSTANTS_APP_KEYS,
  ...swagger.CONSTANTS_SWAGGER_KEYS,
} as const;

export default configs;
