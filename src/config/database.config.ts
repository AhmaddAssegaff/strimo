import { registerAs } from '@nestjs/config';
import * as Joi from 'joi';

export const CONFIG_NAME = 'db' as const;

const dbConfig = registerAs(CONFIG_NAME, () => ({
  DATABASE_HOST: process.env.DATABASE_HOST,
  DATABASE_PORT: process.env.DATABASE_PORT,
  DATABASE_USER: process.env.DATABASE_USER,
  DATABASE_PASSWORD: process.env.DATABASE_PASSWORD,
  DATABASE_NAME: process.env.DATABASE_NAME,
  DATABASE_URL: process.env.DATABASE_URL,
}));

type DbConfig = ReturnType<typeof dbConfig>;
type DbKey = keyof DbConfig;

export const dbValidationSchema = {
  DATABASE_HOST: Joi.string().required(),
  DATABASE_PORT: Joi.number().required(),
  DATABASE_USER: Joi.string().required(),
  DATABASE_PASSWORD: Joi.string().required(),
  DATABASE_NAME: Joi.string().required(),
  DATABASE_URL: Joi.string().required(),
};

export const CONSTANTS_DB_KEYS: {
  DB: {
    [K in DbKey]: `${typeof CONFIG_NAME}.${K}`;
  };
} = {
  DB: {
    DATABASE_HOST: 'db.DATABASE_HOST',
    DATABASE_PORT: 'db.DATABASE_PORT',
    DATABASE_USER: 'db.DATABASE_USER',
    DATABASE_PASSWORD: 'db.DATABASE_PASSWORD',
    DATABASE_NAME: 'db.DATABASE_NAME',
    DATABASE_URL: 'db.DATABASE_URL',
  },
} as const;

export default dbConfig;
