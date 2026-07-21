import { Controller, Get, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { JwtAccessGuard } from '../auth/guard/jwt-access.guard';
import { ApiBearerAuth } from '@nestjs/swagger';
import { CurrentUser } from '../auth/decorator/current-user.decorator';
import type { AuthenticatedUser } from '../auth/auth.interface';

@ApiBearerAuth('access-token')
@UseGuards(JwtAccessGuard)
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('profile')
  getUserProfile(@CurrentUser() user: AuthenticatedUser) {
    return this.userService.findUserProfile(user);
  }
}
