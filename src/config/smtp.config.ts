import { registerAs } from '@nestjs/config';
import * as Joi from 'joi';

export const CONFIG_NAME = 'smtp' as const;

const smtpConfig = registerAs(CONFIG_NAME, () => ({
  SMTP_HOST: process.env.SMTP_HOST,
  SMTP_PORT: process.env.SMTP_PORT,
  SMTP_USER: process.env.SMTP_USER,
  SMTP_PASS: process.env.SMTP_PASS,
  SMTP_FROM: process.env.SMTP_FROM,
}));

type SmtpConfig = ReturnType<typeof smtpConfig>;
type SmtpKey = keyof SmtpConfig;

export const SmtpValidationSchema = {
  SMTP_HOST: Joi.string().required(),
  SMTP_PORT: Joi.number().required(),
  SMTP_USER: Joi.string().required(),
  SMTP_PASS: Joi.string().required(),
  SMTP_FROM: Joi.string().required(),
};

export const CONSTANTS_SMTP_KEYS: {
  SMTP: {
    [K in SmtpKey]: `${typeof CONFIG_NAME}.${K}`;
  };
} = {
  SMTP: {
    SMTP_HOST: 'smtp.SMTP_HOST',
    SMTP_PORT: 'smtp.SMTP_PORT',
    SMTP_USER: 'smtp.SMTP_USER',
    SMTP_PASS: 'smtp.SMTP_PASS',
    SMTP_FROM: 'smtp.SMTP_FROM',
  },
} as const;

export default smtpConfig;
