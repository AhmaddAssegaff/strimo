import { Injectable, NotFoundException } from '@nestjs/common';
import { UserOauthGoogle } from '../auth/interface/auth.interface';
import { UpdateUserProfileDto } from './dto/update-user.dto';
import {
  CreateUserOauthResult,
  UpdateUserProfileResult,
  UserProfileResult,
} from './interface/user.interface';
import { UserRepository } from './user.repository';
import { ProfilePictureStorageService } from '~app/core/storage/profile-picture/profile-picture-storage.service';

@Injectable()
export class UserService {
  constructor(
    private readonly profilePictureStorage: ProfilePictureStorageService,
    private readonly userRepo: UserRepository,
  ) {}

  async createUserOauth(
    userData: UserOauthGoogle,
    banner: string,
    avatar: string,
  ): Promise<CreateUserOauthResult> {
    return await this.userRepo.insertOauthUser(userData, banner, avatar);
  }

  async findUserProfile(userId: string): Promise<UserProfileResult> {
    const user = await this.userRepo.selectUserProfile(userId);

    if (!user) {
      throw new NotFoundException('user not found');
    }

    return user;
  }

  async updateUserProfile(
    userId: string,
    updateUserProfileDto: UpdateUserProfileDto,
  ): Promise<UpdateUserProfileResult> {
    const user = await this.userRepo.updateUserProfile(
      userId,
      updateUserProfileDto,
    );

    const presignedUrl = await this.profilePictureStorage.getProfilePictureUrl(
      user.profilePicture!,
    );

    return {
      ...user,
      profilePicture: presignedUrl,
    };
  }

  async updateUserProfilePicture(
    userId: string,
    file: Express.Multer.File,
  ): Promise<UpdateUserProfileResult> {
    const oldProfilePicture = await this.userRepo.selectUserProfile(userId);

    if (!oldProfilePicture) {
      throw new NotFoundException('Profile picture not found');
    }

    const { objectName, presignedUrl } =
      await this.profilePictureStorage.processAndUpload(userId, file);

    const user = await this.userRepo.updateUserProfilePicture(
      userId,
      objectName,
    );

    if (oldProfilePicture) {
      await this.profilePictureStorage.deleteProfilePicture(
        oldProfilePicture.profilePicture!,
      );
    }

    return {
      ...user,
      profilePicture: presignedUrl,
    };
  }
}
