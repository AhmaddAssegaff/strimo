import { Request } from 'express';
import { Roles } from '../user/entities/user.entity';

/**
 * token JWT (signed)
 */
export interface JwtAuthPayload {
  sub: string;
  role: Roles;
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
  role: Roles;
  email: string;
}

/**
 * Tokens
 */
export interface AuthTokenPair {
  accessToken: string;
  refreshToken: string;
}

export interface accessToken {
  accessToken: string;
}

/**
 * Response auth to client
 */
export interface registerResponseInterface {
  tokens: AuthTokenPair;
}

export interface loginResponseInterface {
  tokens: AuthTokenPair;
}

export interface refreshResponseInterface {
  token: accessToken;
}

/**
 * Request user authenticated
 */
export interface AuthenticatedRequest extends Request {
  user: AuthenticatedUser;
}
