import { ConfigFactory } from '@nestjs/config';
import * as Joi from 'joi';

import * as app from './app.config';

export const configs = [app.default] satisfies ConfigFactory[];

export const validationSchema = Joi.object({
  ...app.appValidationSchema,
});

export const CONSTANTS = {
  ...app.CONSTANTS_APP_KEYS,
} as const;

export default configs;
