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
import { ApiBearerAuth } from '@nestjs/swagger';
import type { AuthenticatedUser } from '../auth/auth.interface';
import { FileInterceptor } from '@nestjs/platform-express';
import { UpdateUserProfile } from './dto/update-user';
import { UPLOAD_RULES } from '~app/core/pipes/file-upload/file-upload.constant';
import { FileUploadPipe } from '~app/core/pipes/file-upload/file-upload.pipe';
import {
  UpdateUserProfileResult,
  UserProfileResult,
} from './interface/user.interface';
import { CurrentUser } from '~app/core/decorators/current-user.decorators';

@ApiBearerAuth('access-token')
@UseGuards(JwtAccessGuard)
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('profile')
  getUserProfile(
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<UserProfileResult> {
    return this.userService.findUserProfile(user);
  }

  @Patch('profile')
  updateProfile(
    @Body() body: UpdateUserProfile,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<UpdateUserProfileResult> {
    return this.userService.updateUserProfile(body, user);
  }

  @Patch('profile/profile-picture')
  @UseInterceptors(FileInterceptor('file'))
  updateProfilePicture(
    @UploadedFile(FileUploadPipe(UPLOAD_RULES.profilePicture))
    file: Express.Multer.File,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<UpdateUserProfileResult> {
    return this.userService.updateUserProfilePicture(file, user);
  }
}
