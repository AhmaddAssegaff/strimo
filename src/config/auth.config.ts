import { registerAs } from '@nestjs/config';
import * as Joi from 'joi';

export const CONFIG_NAME = 'auth' as const;

const authConfig = registerAs(CONFIG_NAME, () => ({
  AUTH_JWT_ACCESS_TOKEN_SECRET: process.env.AUTH_JWT_ACCESS_TOKEN_SECRET,
  AUTH_JWT_ACCESS_TOKEN_EXPIRES_IN:
    process.env.AUTH_JWT_ACCESS_TOKEN_EXPIRES_IN,
  AUTH_JWT_REFRESH_TOKEN_SECRET: process.env.AUTH_JWT_REFRESH_TOKEN_SECRET,
  AUTH_JWT_REFRESH_TOKEN_EXPIRES_IN:
    process.env.AUTH_JWT_REFRESH_TOKEN_EXPIRES_IN,
}));

type AuthConfig = ReturnType<typeof authConfig>;
type AuthKey = keyof AuthConfig;

export const AuthValidationSchema = {
  AUTH_JWT_ACCESS_TOKEN_SECRET: Joi.string().required(),
  AUTH_JWT_ACCESS_TOKEN_EXPIRES_IN: Joi.string().required(),
  AUTH_JWT_REFRESH_TOKEN_SECRET: Joi.string().required(),
  AUTH_JWT_REFRESH_TOKEN_EXPIRES_IN: Joi.string().required(),
};

export const CONSTANTS_AUTH_KEYS: {
  AUTH: {
    [K in AuthKey]: `${typeof CONFIG_NAME}.${K}`;
  };
} = {
  AUTH: {
    AUTH_JWT_ACCESS_TOKEN_SECRET: 'auth.AUTH_JWT_ACCESS_TOKEN_SECRET',
    AUTH_JWT_ACCESS_TOKEN_EXPIRES_IN: 'auth.AUTH_JWT_ACCESS_TOKEN_EXPIRES_IN',
    AUTH_JWT_REFRESH_TOKEN_SECRET: 'auth.AUTH_JWT_REFRESH_TOKEN_SECRET',
    AUTH_JWT_REFRESH_TOKEN_EXPIRES_IN: 'auth.AUTH_JWT_REFRESH_TOKEN_EXPIRES_IN',
  },
} as const;

export default authConfig;
