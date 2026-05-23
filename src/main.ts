import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { CONSTANTS } from './config';
import { VersioningType } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const config = app.get(ConfigService);

  // const APP_MODE = config.getOrThrow<string>(CONSTANTS.APP.NODE_ENV);
  const PORT = config.getOrThrow<string>(CONSTANTS.APP.APP_PORT);
  const DEFAULT_VERSION = config.getOrThrow<string>(
    CONSTANTS.APP.DEFAULT_VERSION,
  );
  const ENABLE_VERSION = config.getOrThrow<string>(
    CONSTANTS.APP.ENABLE_VERSION,
  );
  const API_GLOBAL_PREFIX = config.getOrThrow<string>(
    CONSTANTS.APP.API_GLOBAL_PREFIX,
  );
  const VERSION_PREFIX = config.getOrThrow<string>(
    CONSTANTS.APP.VERSION_PREFIX,
  );

  app.setGlobalPrefix(API_GLOBAL_PREFIX);
  if (ENABLE_VERSION) {
    app.enableVersioning({
      type: VersioningType.URI,
      defaultVersion: DEFAULT_VERSION,
      prefix: VERSION_PREFIX,
    });
  }

  await app.listen(PORT);
}
bootstrap();
