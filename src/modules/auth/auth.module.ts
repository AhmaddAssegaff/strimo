import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UserModule } from '../user/user.module';
import { JwtModule } from '@nestjs/jwt';
import { JwtAccessStrategy } from './strategies/jwt-access.strategy';
import { JwtRefreshStrategy } from './strategies/jwt-refresh.strategy';
import { ConfigModule } from '@nestjs/config';
import { SmtpService } from '~app/infra/smtp/smtp.service';
import { OauthGoogleStrategy } from './strategies/oauth-google.strategy';
import { AvatarStorageModule } from '~app/core/storage/avatar/avatar-storage.module';
import { BannerStorageModule } from '~app/core/storage/banner/banner-storage.module';

@Module({
  imports: [
    ConfigModule,
    UserModule,
    JwtModule,
    AvatarStorageModule,
    BannerStorageModule,
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtAccessStrategy,
    JwtRefreshStrategy,
    OauthGoogleStrategy,
    SmtpService,
  ],
})
export class AuthModule {}
