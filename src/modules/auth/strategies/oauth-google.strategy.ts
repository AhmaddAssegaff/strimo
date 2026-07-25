import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
import { CONSTANTS } from 'src/config';
import { OAUTH_GOOGLE_STRATEGY } from '../interface/auth.constant';
import { Profile, Strategy } from 'passport-google-oauth20';

@Injectable()
export class OauthGoogleStrategy extends PassportStrategy(
  Strategy,
  OAUTH_GOOGLE_STRATEGY,
) {
  constructor(config: ConfigService) {
    super({
      clientID: config.getOrThrow(CONSTANTS.GOOGLE.OAUTH_GOOGLE_CLIENT_ID),
      clientSecret: config.getOrThrow(
        CONSTANTS.GOOGLE.OAUTH_GOOGLE_CLIENT_SECRET,
      ),
      callbackURL: config.getOrThrow(
        CONSTANTS.GOOGLE.OAUTH_GOOGLE_CALLBACK_URL,
      ),
      scope: ['email', 'profile'],
    });
  }

  validate(_accessToken: string, _refreshToken: string, profile: Profile) {
    return {
      googleId: profile.id,
      email: profile.emails?.[0]?.value,
      name: profile.displayName,
      picture: profile.photos?.[0]?.value,
    };
  }
}
