import { Controller, Get, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { JwtAccessGuard } from '../auth/guard/jwt-access.guard';
import { RolesGuard } from '../auth/guard/user-roles.guard';
import { ApiBearerAuth } from '@nestjs/swagger';
import { CurrentUser } from '../auth/decorator/current-user.decorator';
import type { AuthenticatedUser } from '../auth/jwt.interface';

@ApiBearerAuth('access-token')
@UseGuards(JwtAccessGuard, RolesGuard)
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('profile')
  getUserProfile(@CurrentUser() user: AuthenticatedUser) {
    return this.userService.findUserProfile(user);
  }
}
