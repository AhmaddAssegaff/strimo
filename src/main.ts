import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { Logger, ValidationPipe, VersioningType } from '@nestjs/common';
import { AppModule } from '~app/app.module';
import { CONSTANTS } from '~config/index';
import { createDocument } from '~core/swagger/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const config = app.get(ConfigService);

  const APP_NODE_ENV = config.getOrThrow<string>(CONSTANTS.APP.APP_NODE_ENV);
  const PORT = config.getOrThrow<string>(CONSTANTS.APP.APP_PORT);
  const DEFAULT_VERSION = config.getOrThrow<string>(
    CONSTANTS.APP.APP_DEFAULT_VERSION,
  );
  const ENABLE_VERSION = config.getOrThrow<string>(
    CONSTANTS.APP.APP_ENABLE_VERSION,
  );
  const API_GLOBAL_PREFIX = config.getOrThrow<string>(
    CONSTANTS.APP.APP_GLOBAL_PREFIX,
  );
  const VERSION_PREFIX = config.getOrThrow<string>(
    CONSTANTS.APP.APP_VERSION_PREFIX,
  );

  app.setGlobalPrefix(API_GLOBAL_PREFIX);
  if (ENABLE_VERSION) {
    app.enableVersioning({
      type: VersioningType.URI,
      defaultVersion: DEFAULT_VERSION,
      prefix: VERSION_PREFIX,
    });
  }

  if (APP_NODE_ENV === 'development') {
    createDocument(app);
  }

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.enableShutdownHooks();
  Logger.log(`Running in ${APP_NODE_ENV} mode`, 'Bootstrap');
  Logger.log(`Application listening on port ${PORT}`, 'Bootstrap');
  await app.listen(PORT);
}
bootstrap();
