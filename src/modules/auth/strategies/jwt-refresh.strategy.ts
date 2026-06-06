import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { CONSTANTS } from 'src/config';
import { AuthenticatedUser, JwtAuthPayload } from '../jwt.interface';
import { JWT_REFRESH_TOKEN_STRATEGY } from '../auth.constant';

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(
  Strategy,
  JWT_REFRESH_TOKEN_STRATEGY,
) {
  constructor(config: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: config.getOrThrow(
        CONSTANTS.AUTH.AUTH_JWT_REFRESH_TOKEN_SECRET,
      ),
      algorithms: ['HS256'],
      ignoreExpiration: false,
    });
  }

  validate(payload: JwtAuthPayload): AuthenticatedUser {
    return {
      sub: payload.sub,
      role: payload.role,
      email: payload.email,
    };
  }
}
