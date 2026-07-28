import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { OAUTH_GOOGLE_STRATEGY } from '../interface/auth.constant';

@Injectable()
export class GoogleAuthGuard extends AuthGuard(OAUTH_GOOGLE_STRATEGY) {}
