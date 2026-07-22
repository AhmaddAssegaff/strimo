import { Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UserService } from '../user/user.service';
import { JwtService } from '@nestjs/jwt';
import { CONSTANTS } from '~app/config';
import type {
  JwtAuthPayload,
  oauthGoogleResponseInterface,
  refreshResponseInterface,
  userOauthGoogle,
} from './auth.interface';

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

  async googleOauth(
    user: userOauthGoogle,
  ): Promise<oauthGoogleResponseInterface> {
    const usr = await this.userService.createUserOauth(user);

    const payload: JwtAuthPayload = {
      sub: usr.id,
      email: usr.email,
    };

    return {
      tokens: {
        accessToken: this.signAccessToken(payload),
        refreshToken: this.signRefreshToken(payload),
      },
    };
  }

  async refreshToken(
    payloadUser: JwtAuthPayload,
  ): Promise<refreshResponseInterface> {
    const user = await this.userService.findUserCredensialById(payloadUser.sub);

    if (!user) {
      throw new NotFoundException('user not found');
    }

    const payload: JwtAuthPayload = {
      sub: user?.id,
      email: user.email,
    };

    return {
      token: {
        accessToken: this.signAccessToken(payload),
      },
    };
  }
}
