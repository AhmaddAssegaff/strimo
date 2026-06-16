import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Query,
  ParseUUIDPipe,
} from '@nestjs/common';
import { UserManagementService } from './user-management.service';
import { Roles } from '../user/entities/user.entity';
import { userRoles } from '../auth/decorator/roles.decorator';
import { CreateUserDto } from '../user/dto/create-user.dto';
import { FindUserManagerDto } from './dto/find-manager.dto';
import { FindUserCashierDto } from './dto/find-cashier.dto';
import { UpdateStatusUserDto } from './dto/update-status-user.dto';

@Controller('user')
export class UserManagementController {
  constructor(private readonly userManagementService: UserManagementService) {}

  @userRoles(Roles.owner)
  @Post()
  postUser(@Body() createUserDto: CreateUserDto) {
    return this.userManagementService.createUser(createUserDto);
  }

  @userRoles(Roles.owner)
  @Get('manager')
  getUsersManager(@Query() findUserManagerDto: FindUserManagerDto) {
    return this.userManagementService.findUsersManager(findUserManagerDto);
  }

  @userRoles(Roles.owner, Roles.manager)
  @Get('cashier')
  getUsersCashier(@Query() findUserCashierDto: FindUserCashierDto) {
    return this.userManagementService.findUsersCashier(findUserCashierDto);
  }

  @userRoles(Roles.owner)
  @Get('manager/:id')
  findUserManagerById(@Param('id') id: string) {
    return this.userManagementService.findUserManagerById(id);
  }

  @userRoles(Roles.owner, Roles.manager)
  @Get('cashier/:id')
  findUserCashierById(@Param('id') id: string) {
    return this.userManagementService.findUserCashierById(id);
  }

  @userRoles(Roles.owner)
  @Patch('manager/status/:id')
  patchUserManagerStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateStatusUserDto: UpdateStatusUserDto,
  ) {
    return this.userManagementService.updateUserManagerStatus(
      id,
      updateStatusUserDto,
    );
  }

  @userRoles(Roles.manager, Roles.owner)
  @Patch('cashier/status/:id')
  patchUserCashierStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateStatusUserDto: UpdateStatusUserDto,
  ) {
    return this.userManagementService.updateUserCashierStatus(
      id,
      updateStatusUserDto,
    );
  }
}
