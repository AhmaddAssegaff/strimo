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
} from './jwt.interface';
import { ApiBearerAuth } from '@nestjs/swagger';
import { JwtRefreshGuard } from './guard/jwt-refresh.guard';
import { CurrentUser } from './decorator/current-user.decorator';
import { JwtAccessGuard } from './guard/jwt-access.guard';
import { VerifyAccountConfirmDto } from './dto/verify-account.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @HttpCode(200)
  @Post('login')
  login(@Body() loginDto: LoginDto): Promise<loginResponseInterface> {
    return this.authService.login(loginDto);
  }

  @Post('reqister')
  registter(
    @Body() ReqisterDto: registerDto,
  ): Promise<registerResponseInterface> {
    return this.authService.register(ReqisterDto);
  }

  @HttpCode(200)
  @ApiBearerAuth('refresh-token')
  @UseGuards(JwtRefreshGuard)
  @Post('refresh-token')
  refreshToken(
    @CurrentUser() user: JwtAuthPayload,
  ): Promise<refreshResponseInterface> {
    return this.authService.refreshToken(user);
  }

  @Get('verify-account')
  @ApiBearerAuth('access-token')
  @UseGuards(JwtAccessGuard)
  async requestVerifyAccount(@CurrentUser() user: JwtAuthPayload) {
    return this.authService.requestEmailVerification(user);
  }

  @HttpCode(200)
  @Post('verify-account/confirm')
  async confirmVerifyAccount(@Body() dto: VerifyAccountConfirmDto) {
    return this.authService.confirmEmailVerification(dto.token);
  }
}
