import { ForbiddenException, Injectable } from '@nestjs/common';
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

@Injectable()
export class AuthService {
  private readonly accessSecret: string;
  private readonly accessExpiresIn: number;
  private readonly refreshSecret: string;
  private readonly refreshExpiresIn: number;

  constructor(
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
    private readonly userService: UserService,
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
    const user = await this.userService.findOneUserByEmail(loginDto.email);

    if (user.status !== Status.active) {
      throw new ForbiddenException('Account is deactivated');
    }

    const payload: JwtAuthPayload = {
      sub: user?.id,
      role: user.role,
      email: user.email,
    };

    return {
      tokens: {
        accessToken: this.signRefreshToken(payload),
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
    const user = await this.userService.findOneUserById(payloadUser.sub);

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
        accessToken: this.signRefreshToken(payload),
      },
    };
  }
}
