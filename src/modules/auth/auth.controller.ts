import { Controller, Post, HttpCode, UseGuards, Get } from '@nestjs/common';
import { AuthService } from './auth.service';
import type {
  refreshResponseInterface,
  JwtAuthPayload,
  userOauthGoogle,
} from './auth.interface';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtRefreshGuard } from './guard/jwt-refresh.guard';
import { CurrentUser } from './decorator/current-user.decorator';
import { GoogleAuthGuard } from './guard/oauth-google.guard';
import { oauthGoogleResponseInterface } from './auth.interface';

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
    @CurrentUser() user: userOauthGoogle,
  ): Promise<oauthGoogleResponseInterface> {
    return this.authService.googleOauth(user);
  }

  @ApiBearerAuth()
  @HttpCode(200)
  @UseGuards(JwtRefreshGuard)
  @Post('refresh-token')
  refreshToken(
    @CurrentUser() user: JwtAuthPayload,
  ): Promise<refreshResponseInterface> {
    return this.authService.refreshToken(user);
  }
}
