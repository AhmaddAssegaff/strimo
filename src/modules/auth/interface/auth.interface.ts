import { Request } from 'express';

export interface UserOauthGoogle {
  googleId: string;
  email: string;
  name: string;
  picture: string;
}

/**
 * token JWT (signed)
 */
export interface JwtAuthPayload {
  sub: string;
  email: string;
  iat?: number;
  exp?: number;
}

/**
 * User context
 * (request.user)
 */
export interface AuthenticatedUser {
  sub: string;
  email: string;
}

/**
 * Tokens
 */
export interface AuthTokenPair {
  accessToken: string;
  refreshToken: string;
}

export interface AccessToken {
  accessToken: string;
}

/**
 * Response auth to client
 */

export interface RefreshTokenResult {
  token: AccessToken;
}

export interface OauthGoogleResult {
  OauthGoogleResponseInterface: AuthTokenPair;
}

/**
 * Request user authenticated
 */
export interface AuthenticatedRequest extends Request {
  user: AuthenticatedUser;
}
