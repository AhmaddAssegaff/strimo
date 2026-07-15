import { registerAs } from '@nestjs/config';
import * as Joi from 'joi';

export const CONFIG_NAME = 'google' as const;

const googleConfig = registerAs(CONFIG_NAME, () => ({
  OAUTH_GOOGLE_CLIENT_ID: process.env.OAUTH_GOOGLE_CLIENT_ID,
  OAUTH_GOOGLE_CLIENT_SECRET: process.env.OAUTH_GOOGLE_CLIENT_SECRET,
  OAUTH_GOOGLE_CALLBACK_URL: process.env.OAUTH_GOOGLE_CALLBACK_URL,
  OAUTH_GOOGLE_SCOPE: process.env.OAUTH_GOOGLE_SCOPE,
}));

type GoogleConfig = ReturnType<typeof googleConfig>;
type GoogleKey = keyof GoogleConfig;

export const GoogleValidationSchema = {
  OAUTH_GOOGLE_CLIENT_ID: Joi.string().required(),
  OAUTH_GOOGLE_CLIENT_SECRET: Joi.string().required(),
  OAUTH_GOOGLE_CALLBACK_URL: Joi.string().required(),
  OAUTH_GOOGLE_SCOPE: Joi.string().required(),
};

export const CONSTANTS_GOOGLE_KEYS: {
  GOOGLE: {
    [K in GoogleKey]: `${typeof CONFIG_NAME}.${K}`;
  };
} = {
  GOOGLE: {
    OAUTH_GOOGLE_CLIENT_ID: 'google.OAUTH_GOOGLE_CLIENT_ID',
    OAUTH_GOOGLE_CLIENT_SECRET: 'google.OAUTH_GOOGLE_CLIENT_SECRET',
    OAUTH_GOOGLE_CALLBACK_URL: 'google.OAUTH_GOOGLE_CALLBACK_URL',
    OAUTH_GOOGLE_SCOPE: 'google.OAUTH_GOOGLE_SCOPE',
  },
} as const;

export default googleConfig;
