import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { LoginDto } from './dto/login.dto';
import { registerDto } from './dto/register.dto';
import { ConfigService } from '@nestjs/config';
import { UserService } from '../user/user.service';
import { JwtService } from '@nestjs/jwt';
import { CONSTANTS } from '~app/config';
import type {
  registerResponseInterface,
  JwtAuthPayload,
  refreshResponseInterface,
  loginResponseInterface,
} from './jwt.interface';
import { Status } from '../user/entities/user.entity';
import * as bcrypt from 'bcrypt';
import { RedisService } from '~app/core/redis/redis.service';
import { SmtpService } from '~app/core/smtp/smtp.service';

@Injectable()
export class AuthService {
  private readonly accessSecret: string;
  private readonly accessExpiresIn: number;
  private readonly refreshSecret: string;
  private readonly refreshExpiresIn: number;
  private readonly OTPttl: number;
  private readonly generateOTP: number;

  constructor(
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
    private readonly userService: UserService,
    private readonly redisService: RedisService,
    private readonly smtpService: SmtpService,
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
    this.OTPttl = 60 * 15;
    this.generateOTP = Math.floor(100000 + Math.random() * 900000);
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

  async login(loginDto: LoginDto): Promise<loginResponseInterface> {
    const user = await this.userService.findUserCredensialByEmail(
      loginDto.email,
    );
    const isPasswordValid = await bcrypt.compare(
      loginDto.password,
      user.password,
    );

    if (user.status !== Status.active) {
      throw new ForbiddenException('Account is deactivated');
    }

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload: JwtAuthPayload = {
      sub: user?.id,
      role: user.role,
      email: user.email,
    };

    return {
      tokens: {
        accessToken: this.signAccessToken(payload),
        refreshToken: this.signRefreshToken(payload),
      },
    };
  }

  async register(registerDto: registerDto): Promise<registerResponseInterface> {
    const user = await this.userService.createUser(registerDto);

    const payload: JwtAuthPayload = {
      sub: user.id,
      role: user.role,
      email: user.email,
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

    if (user.status !== Status.active) {
      throw new ForbiddenException('Account is deactivated');
    }

    const payload: JwtAuthPayload = {
      sub: user?.id,
      role: user.role,
      email: user.email,
    };

    return {
      token: {
        accessToken: this.signAccessToken(payload),
      },
    };
  }

  async requestEmailVerification(payloadUser: JwtAuthPayload) {
    const user = await this.userService.findUserCredensialById(payloadUser.sub);

    if (user.status !== Status.active) {
      throw new ForbiddenException('Account is deactivated');
    }

    if (user.is_email_verified) {
      throw new BadRequestException('Email already verified');
    }

    console.log({
      verified: user.is_email_verified,
      type: typeof user.is_email_verified,
    });
    const otpCode = this.generateOTP.toString();

    await this.redisService.set(
      `verify-account:${otpCode}`,
      user.id,
      this.OTPttl,
    );

    await this.smtpService.sendVerifyOtp(user.email, otpCode);

    return {
      message: 'Kode verifikasi telah dikirim ke email Anda.',
    };
  }

  async confirmEmailVerification(token: string) {
    const redisKey = `verify-account:${token}`;

    const userId = await this.redisService.get<string>(redisKey);

    if (!userId) {
      throw new BadRequestException(
        'Kode verifikasi salah atau telah kedaluwarsa',
      );
    }

    await this.userService.updateVerifyStatus(userId);

    await this.redisService.del(redisKey);

    return {
      message: 'Akun Anda berhasil diverifikasi!',
    };
  }
}
