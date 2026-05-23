import { registerAs } from '@nestjs/config';
import * as Joi from 'joi';

export const CONFIG_NAME = 'app' as const;

const appConfig = registerAs(CONFIG_NAME, () => ({
  APP_PORT: process.env.APP_PORT,
  APP_NODE_ENV: process.env.APP_NODE_ENV,
  APP_GLOBAL_PREFIX: process.env.APP_GLOBAL_PREFIX,
  APP_ENABLE_VERSION: process.env.APP_ENABLE_VERSION,
  APP_VERSION_PREFIX: process.env.APP_VERSION_PREFIX,
  APP_DEFAULT_VERSION: process.env.APP_DEFAULT_VERSION,
}));

type AppConfig = ReturnType<typeof appConfig>;
type AppKey = keyof AppConfig;

export const appValidationSchema = {
  APP_PORT: Joi.number().required(),
  NODE_ENV: Joi.string()
    .valid('development', 'staging', 'production')
    .required(),
  APP_GLOBAL_PREFIX: Joi.string().required(),
  APP_ENABLE_VERSION: Joi.boolean().required(),
  APP_VERSION_PREFIX: Joi.string().required(),
  APP_DEFAULT_VERSION: Joi.string().required(),
};

export const CONSTANTS_APP_KEYS: {
  APP: {
    [K in AppKey]: `${typeof CONFIG_NAME}.${K}`;
  };
} = {
  APP: {
    APP_PORT: 'app.APP_PORT',
    APP_NODE_ENV: 'app.APP_NODE_ENV',
    APP_GLOBAL_PREFIX: 'app.APP_GLOBAL_PREFIX',
    APP_DEFAULT_VERSION: 'app.APP_DEFAULT_VERSION',
    APP_ENABLE_VERSION: 'app.APP_ENABLE_VERSION',
    APP_VERSION_PREFIX: 'app.APP_VERSION_PREFIX',
  },
} as const;

export default appConfig;
