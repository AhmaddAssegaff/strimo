import { registerAs } from '@nestjs/config';
import * as Joi from 'joi';

export const CONFIG_NAME = 'swagger' as const;

export const swaggerConfig = registerAs(CONFIG_NAME, () => ({
  SWAGGER_DOCS_URL: process.env.SWAGGER_DOCS_URL,
}));

type SwaggerConfigs = ReturnType<typeof swaggerConfig>;
type SwaggerKey = keyof SwaggerConfigs;

export const swaggerValidationSchema = {
  SWAGGER_DOCS_URL: Joi.string().required(),
};

export const CONSTANTS_SWAGGER_KEYS: {
  SWAGGER: {
    [K in SwaggerKey]: `${typeof CONFIG_NAME}.${K}`;
  };
} = {
  SWAGGER: {
    SWAGGER_DOCS_URL: 'swagger.SWAGGER_DOCS_URL',
  },
} as const;

export interface SwaggerConfig {
  title: string;
  description: string;
  version: string;
  tags: string[];
}

export const SWAGGER_CONFIG: SwaggerConfig = {
  title: 'Backend docs strimo',
  description:
    'Strimo Backend service for a scalable video streaming platform supporting HLS/DASH adaptive bitrate streaming, FFmpeg transcoding, media processing queues, and independent delivery of audio and video streams.',
  version: '1.0',
  tags: [],
};

export default swaggerConfig;
