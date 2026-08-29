import {
  Body,
  Controller,
  Get,
  Patch,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { UserService } from './user.service';
import { JwtAccessGuard } from '../auth/guard/jwt-access.guard';
import type { AuthenticatedUser } from '../auth/interface/auth.interface';
import { FileInterceptor } from '@nestjs/platform-express';
import { UpdateUserProfileDto } from './dto/update-user.dto';
import { FILE_RULES } from '~app/core/pipes/file-upload/file-upload.constant';
import { FileUploadPipe } from '~app/core/pipes/file-upload/file-upload.pipe';
import {
  UpdateUserProfileResult,
  UserProfileResult,
} from './interface/user.interface';
import { CurrentUser } from '~app/core/decorators/current-user.decorators';

@UseGuards(JwtAccessGuard)
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('profile')
  getUserProfile(
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<UserProfileResult> {
    return this.userService.findUserProfile(user.sub);
  }

  @Patch('profile')
  updateProfile(
    @Body() updateUserProfileDto: UpdateUserProfileDto,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<UpdateUserProfileResult> {
    return this.userService.updateUserProfile(user.sub, updateUserProfileDto);
  }

  @Patch('profile/profile-picture')
  @UseInterceptors(FileInterceptor('profile-picture'))
  updateProfilePicture(
    @UploadedFile(FileUploadPipe(FILE_RULES.profilePicture))
    file: Express.Multer.File,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<UpdateUserProfileResult> {
    return this.userService.updateUserProfilePicture(user.sub, file);
  }
}
