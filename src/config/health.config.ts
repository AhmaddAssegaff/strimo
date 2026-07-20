import { registerAs } from '@nestjs/config';
import * as Joi from 'joi';

export const CONFIG_NAME = 'health' as const;

const healthConfig = registerAs(CONFIG_NAME, () => ({
  HEALTH_MEMORY_HEAP_LIMIT: process.env.HEALTH_MEMORY_HEAP_LIMIT,
  HEALTH_MEMORY_RSS_LIMIT: process.env.HEALTH_MEMORY_RSS_LIMIT,
  HEALTH_DISK_THRESHOLD: process.env.HEALTH_DISK_THRESHOLD,
}));

type HealthConfig = ReturnType<typeof healthConfig>;
type HealthKey = keyof HealthConfig;

export const HealthValidationSchema = {
  HEALTH_MEMORY_HEAP_LIMIT: Joi.number().required(),
  HEALTH_MEMORY_RSS_LIMIT: Joi.number().required(),
  HEALTH_DISK_THRESHOLD: Joi.number().required(),
};

export const CONSTANTS_HEALTH_KEYS: {
  HEALTH: {
    [K in HealthKey]: `${typeof CONFIG_NAME}.${K}`;
  };
} = {
  HEALTH: {
    HEALTH_MEMORY_HEAP_LIMIT: 'health.HEALTH_MEMORY_HEAP_LIMIT',
    HEALTH_MEMORY_RSS_LIMIT: 'health.HEALTH_MEMORY_RSS_LIMIT',
    HEALTH_DISK_THRESHOLD: 'health.HEALTH_DISK_THRESHOLD',
  },
} as const;

export default healthConfig;
