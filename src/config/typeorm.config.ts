import { registerAs } from '@nestjs/config';
import * as Joi from 'joi';

export const CONFIG_NAME = 'typeorm' as const;

const typeormConfig = registerAs(CONFIG_NAME, () => ({
  TYPEORM_AUTO_LOAD_ENTITIES: process.env.TYPEORM_AUTO_LOAD_ENTITIES,
  TYPEORM_SYNCHRONIZE: process.env.TYPEORM_SYNCHRONIZE
}));

type TypeOrmConfig = ReturnType<typeof typeormConfig>;
type TypeOrmKey = keyof TypeOrmConfig;

export const TypeOrmValidationSchema = {
  TYPEORM_AUTO_LOAD_ENTITIES: Joi.boolean().required(),
  TYPEORM_SYNCHRONIZE: Joi.boolean().required()
};

export const CONSTANTS_TYPEORM_KEYS: {
  TYPEORM: {
    [K in TypeOrmKey]: `${typeof CONFIG_NAME}.${K}`;
  };
} = {
  TYPEORM: {
    TYPEORM_AUTO_LOAD_ENTITIES: 'typeorm.TYPEORM_AUTO_LOAD_ENTITIES',
    TYPEORM_SYNCHRONIZE: 'typeorm.TYPEORM_SYNCHRONIZE'
  },
} as const;

export default typeormConfig;
