import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  ParseUUIDPipe,
  Query,
  Patch,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { JwtAccessGuard } from '../auth/guard/jwt-access.guard';
import { RolesGuard } from '../auth/guard/user-roles.guard';
import { Roles } from './entities/user.entity';
import { userRoles } from '../auth/decorator/roles.decorator';
import { UpdateStatusUserDto } from './dto/update-status-user.dto';
import { FindUserManagerDto } from './dto/find-manager.dto';
import { FindUserCashierDto } from './dto/find-cashier.dto';
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

  @userRoles(Roles.owner)
  @Post()
  postUser(@Body() createUserDto: CreateUserDto) {
    return this.userService.createUser(createUserDto);
  }

  @userRoles(Roles.owner)
  @Get('manager')
  getUsersManager(@Query() findUserManagerDto: FindUserManagerDto) {
    return this.userService.findUsersManager(findUserManagerDto);
  }

  @userRoles(Roles.owner, Roles.manager)
  @Get('cashier')
  getUsersCashier(@Query() findUserCashierDto: FindUserCashierDto) {
    return this.userService.findUsersCashier(findUserCashierDto);
  }

  @userRoles(Roles.owner)
  @Get('manager/:id')
  findUserManagerById(@Param('id') id: string) {
    return this.userService.findUserManagerById(id);
  }

  @userRoles(Roles.owner, Roles.manager)
  @Get('cashier/:id')
  findUserCashierById(@Param('id') id: string) {
    return this.userService.findUserCashierById(id);
  }

  @userRoles(Roles.owner)
  @Patch('manager/status/:id')
  patchUserManagerStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateStatusUserDto: UpdateStatusUserDto,
  ) {
    return this.userService.updateUserManagerStatus(id, updateStatusUserDto);
  }

  @userRoles(Roles.manager, Roles.owner)
  @Patch('cashier/status/:id')
  patchUserCashierStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateStatusUserDto: UpdateStatusUserDto,
  ) {
    return this.userService.updateUserCashierStatus(id, updateStatusUserDto);
  }
}
