import { Global, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CONSTANTS } from '../../config/index';

@Global()
@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.getOrThrow(CONSTANTS.DB.DATABASE_HOST),
        port: config.getOrThrow(CONSTANTS.DB.DATABASE_PORT),
        username: config.getOrThrow(CONSTANTS.DB.DATABASE_USER),
        password: config.getOrThrow(CONSTANTS.DB.DATABASE_PASSWORD),
        database: config.getOrThrow(CONSTANTS.DB.DATABASE_NAME),
        autoLoadEntities: config.getOrThrow(
          CONSTANTS.TYPEORM.TYPEORM_AUTO_LOAD_ENTITIES,
        ),
        synchronize: config.getOrThrow(CONSTANTS.TYPEORM.TYPEORM_SYNCHRONIZE),
      }),
    }),
  ],
})
export class DatabaseModule {}
