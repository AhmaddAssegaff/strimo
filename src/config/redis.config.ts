import { registerAs } from '@nestjs/config';
import * as Joi from 'joi';

export const CONFIG_NAME = 'redis' as const;

const redisConfig = registerAs(CONFIG_NAME, () => ({
  REDIS_HOST: process.env.REDIS_HOST,
  REDIS_PORT: Number(process.env.REDIS_PORT),
  REDIS_PASSWORD: process.env.REDIS_PASSWORD,
  REDIS_CONNECT_TIMEOUT_MS: Number(process.env.REDIS_CONNECT_TIMEOUT_MS),
  REDIS_MAX_RECONNECT_DELAY_MS: Number(
    process.env.REDIS_MAX_RECONNECT_DELAY_MS,
  ),
  REDIS_RECONNECT_MULTIPLIER: Number(process.env.REDIS_RECONNECT_MULTIPLIER),
}));
type RedisConfig = ReturnType<typeof redisConfig>;
type RedisKey = keyof RedisConfig;

export const RedisValidationSchema = {
  REDIS_HOST: Joi.string().required(),
  REDIS_PORT: Joi.number().required(),
  REDIS_PASSWORD: Joi.string().required(),
  REDIS_CONNECT_TIMEOUT_MS: Joi.number().required(),
  REDIS_MAX_RECONNECT_DELAY_MS: Joi.number().required(),
  REDIS_RECONNECT_MULTIPLIER: Joi.number().required(),
};

export const CONSTANTS_REDIS_KEYS: {
  REDIS: {
    [K in RedisKey]: `${typeof CONFIG_NAME}.${K}`;
  };
} = {
  REDIS: {
    REDIS_HOST: 'redis.REDIS_HOST',
    REDIS_PORT: 'redis.REDIS_PORT',
    REDIS_PASSWORD: 'redis.REDIS_PASSWORD',
    REDIS_CONNECT_TIMEOUT_MS: 'redis.REDIS_CONNECT_TIMEOUT_MS',
    REDIS_MAX_RECONNECT_DELAY_MS: 'redis.REDIS_MAX_RECONNECT_DELAY_MS',
    REDIS_RECONNECT_MULTIPLIER: 'redis.REDIS_RECONNECT_MULTIPLIER',
  },
} as const;

export default redisConfig;
