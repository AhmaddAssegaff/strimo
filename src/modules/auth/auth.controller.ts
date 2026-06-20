import {
  Controller,
  Post,
  Body,
  HttpCode,
  UseGuards,
  Get,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { registerDto } from './dto/register.dto';
import type {
  loginResponseInterface,
  refreshResponseInterface,
  registerResponseInterface,
  JwtAuthPayload,
  userOauthGoogle,
} from './auth.interface';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtRefreshGuard } from './guard/jwt-refresh.guard';
import { CurrentUser } from './decorator/current-user.decorator';
import { JwtAccessGuard } from './guard/jwt-access.guard';
import { VerifyAccountConfirmDto } from './dto/verify-account.dto';
import { GoogleAuthGuard } from './guard/oauth-google.guard';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiOperation({
    summary: 'Login with Google',
    description: 'Redirect the user to Google OAuth consent screen.',
  })
  @ApiResponse({
    status: 302,
    description: 'Redirect to Google OAuth page',
  })
  @Get('oauth/google')
  @UseGuards(GoogleAuthGuard)
  googleOauth() {}

  @ApiOperation({
    summary: 'Google OAuth callback',
    description:
      'Handle Google OAuth callback and return JWT access token and refresh token.',
  })
  @ApiResponse({
    status: 200,
    description: 'OAuth login successful',
  })
  @ApiResponse({
    status: 401,
    description: 'OAuth authentication failed',
  })
  @Get('oauth/google/callback')
  @UseGuards(GoogleAuthGuard)
  googleOauthCallback(@CurrentUser() user: userOauthGoogle) {
    return this.authService.googleOauth(user);
  }

  @ApiOperation({
    summary: 'Login',
    description:
      'Authenticate user using email and password and return JWT tokens.',
  })
  @ApiResponse({
    status: 200,
    description: 'Login successful',
  })
  @ApiResponse({
    status: 401,
    description: 'Invalid credentials',
  })
  @ApiResponse({
    status: 403,
    description: 'Account is deactivated',
  })
  @HttpCode(200)
  @Post('login')
  login(@Body() loginDto: LoginDto): Promise<loginResponseInterface> {
    return this.authService.login(loginDto);
  }

  @ApiOperation({
    summary: 'Register',
    description: 'Create a new local account using email and password.',
  })
  @ApiResponse({
    status: 201,
    description: 'Account created successfully',
  })
  @ApiResponse({
    status: 409,
    description: 'Email already exists',
  })
  @Post('register')
  register(
    @Body() registerDto: registerDto,
  ): Promise<registerResponseInterface> {
    return this.authService.register(registerDto);
  }

  @ApiOperation({
    summary: 'Refresh access token',
    description: 'Generate a new access token using a valid refresh token.',
  })
  @ApiBearerAuth('refresh-token')
  @ApiResponse({
    status: 200,
    description: 'Access token refreshed successfully',
  })
  @ApiResponse({
    status: 401,
    description: 'Invalid refresh token',
  })
  @HttpCode(200)
  @UseGuards(JwtRefreshGuard)
  @Post('refresh-token')
  refreshToken(
    @CurrentUser() user: JwtAuthPayload,
  ): Promise<refreshResponseInterface> {
    return this.authService.refreshToken(user);
  }

  @ApiOperation({
    summary: 'Request email verification',
    description:
      'Send an OTP verification code to the authenticated user email address.',
  })
  @ApiBearerAuth('access-token')
  @ApiResponse({
    status: 200,
    description: 'Verification code sent successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Email already verified',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  @ApiResponse({
    status: 403,
    description: 'Account is deactivated',
  })
  @UseGuards(JwtAccessGuard)
  @Get('verify-account')
  requestVerifyAccount(@CurrentUser() user: JwtAuthPayload) {
    return this.authService.requestEmailVerification(user);
  }

  @ApiOperation({
    summary: 'Confirm email verification',
    description: 'Verify account using OTP code received through email.',
  })
  @ApiResponse({
    status: 200,
    description: 'Email verified successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid or expired OTP code',
  })
  @HttpCode(200)
  @Post('verify-account/confirm')
  confirmVerifyAccount(@Body() dto: VerifyAccountConfirmDto) {
    return this.authService.confirmEmailVerification(dto.token);
  }
}
