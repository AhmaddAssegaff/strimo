import { Controller, Post, HttpCode, UseGuards, Get } from '@nestjs/common';
import { AuthService } from './auth.service';
import type {
  RefreshTokenResult,
  UserOauthGoogle,
  AuthenticatedUser,
} from './interface/auth.interface';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtRefreshGuard } from './guard/jwt-refresh.guard';
import { GoogleAuthGuard } from './guard/oauth-google.guard';
import { OauthGoogleResult } from './interface/auth.interface';
import { CurrentUser } from '~app/core/decorators/current-user.decorators';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('oauth/google')
  @UseGuards(GoogleAuthGuard)
  googleOauth() {}

  @Get('oauth/google/callback')
  @UseGuards(GoogleAuthGuard)
  googleOauthCallback(
    @CurrentUser() user: UserOauthGoogle,
  ): Promise<OauthGoogleResult> {
    return this.authService.googleOauth(user);
  }

  @ApiBearerAuth()
  @HttpCode(200)
  @UseGuards(JwtRefreshGuard)
  @Post('refresh-token')
  refreshToken(
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<RefreshTokenResult> {
    return this.authService.refreshToken(user);
  }
}
