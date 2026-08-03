import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UserService } from '../user/user.service';
import { JwtService } from '@nestjs/jwt';
import { CONSTANTS } from '~app/config';
import type {
  AuthenticatedUser,
  JwtAuthPayload,
  OauthGoogleResult,
  RefreshTokenResult,
  UserOauthGoogle,
} from './interface/auth.interface';
import { AvatarStorageService } from '~app/core/object-storage/avatar-storage.service';
import { BannerStorageService } from '~app/core/object-storage/banner-storage.service';

@Injectable()
export class AuthService {
  private readonly accessSecret: string;
  private readonly accessExpiresIn: number;
  private readonly refreshSecret: string;
  private readonly refreshExpiresIn: number;

  constructor(
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
    private readonly userService: UserService,
    private readonly avatar: AvatarStorageService,
    private readonly banner: BannerStorageService,
  ) {
    this.accessSecret = this.config.getOrThrow(
      CONSTANTS.AUTH.AUTH_JWT_ACCESS_TOKEN_SECRET,
    );
    this.accessExpiresIn = this.config.getOrThrow(
      CONSTANTS.AUTH.AUTH_JWT_ACCESS_TOKEN_EXPIRES_IN,
    );
    this.refreshSecret = this.config.getOrThrow(
      CONSTANTS.AUTH.AUTH_JWT_REFRESH_TOKEN_SECRET,
    );
    this.refreshExpiresIn = this.config.getOrThrow(
      CONSTANTS.AUTH.AUTH_JWT_REFRESH_TOKEN_EXPIRES_IN,
    );
  }

  private signAccessToken(payload: JwtAuthPayload): string {
    return this.jwtService.sign(payload, {
      algorithm: 'HS256',
      secret: this.accessSecret,
      expiresIn: this.accessExpiresIn,
    });
  }

  private signRefreshToken(payload: JwtAuthPayload): string {
    return this.jwtService.sign(payload, {
      algorithm: 'HS256',
      secret: this.refreshSecret,
      expiresIn: this.refreshExpiresIn,
    });
  }

  async googleOauth(user: UserOauthGoogle): Promise<OauthGoogleResult> {
    const usr = await this.userService.createUserOauth(
      user,
      this.banner.getDefaultKey(),
      this.avatar.getDefaultKey(),
    );

    const payload: JwtAuthPayload = {
      sub: usr.id,
      channelId: usr.channel.id,
      email: usr.email,
    };

    return {
      tokens: {
        accessToken: this.signAccessToken(payload),
        refreshToken: this.signRefreshToken(payload),
      },
    };
  }

  refreshToken(user: AuthenticatedUser): RefreshTokenResult {
    const payload: JwtAuthPayload = {
      sub: user.sub,
      channelId: user.channelId,
      email: user.email,
    };

    const newAccessToken = this.signAccessToken(payload);

    return {
      token: {
        accessToken: newAccessToken,
      },
    };
  }
}
