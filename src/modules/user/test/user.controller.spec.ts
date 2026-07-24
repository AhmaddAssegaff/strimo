import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from '../user.controller';
import { UserService } from '../user.service';
import { MockUserService } from './user.mock.test';
import { AuthenticatedUser } from '~app/modules/auth/auth.interface';
import { createMockUserService } from './user.factory.test';
import { UpdateUserProfile } from '../dto/update-user';

describe('UserController', () => {
  let userController: UserController;
  let userService: MockUserService;

  beforeEach(async () => {
    userService = createMockUserService();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        {
          provide: UserService,
          useValue: userService,
        },
      ],
    }).compile();

    userController = module.get<UserController>(UserController);
  });

  describe('getUserProfile', () => {
    it('should only call UserService.findUserProfile', async () => {
      const user: AuthenticatedUser = {
        email: 'email@gmail.com',
        sub: 'a2802656-fe30-4a25-b469-859fb9bbb50d',
      };

      await userController.getUserProfile(user);

      expect(userService.findUserProfile).toHaveBeenCalledTimes(1);
      expect(userService.findUserProfile).toHaveBeenCalledWith(user);
    });
  });

  describe('updateProfile', () => {
    it('should only call UserService.updateUserProfile', async () => {
      const user: AuthenticatedUser = {
        email: 'email@gmail.com',
        sub: 'a2802656-fe30-4a25-b469-859fb9bbb50d',
      };

      const dto: UpdateUserProfile = {
        username: 'new username',
      };

      await userController.updateProfile(dto, user);

      expect(userService.updateUserProfile).toHaveBeenCalledTimes(1);
      expect(userService.updateUserProfile).toHaveBeenCalledWith(dto, user);
    });
  });

  describe('updateProfilePicture', () => {
    it('should only call UserService.updateUserProfilePicture', async () => {
      const user: AuthenticatedUser = {
        email: 'email@gmail.com',
        sub: 'a2802656-fe30-4a25-b469-859fb9bbb50d',
      };

      const file = {} as Express.Multer.File;

      await userController.updateProfilePicture(file, user);

      expect(userService.updateUserProfilePicture).toHaveBeenCalledTimes(1);
      expect(userService.updateUserProfilePicture).toHaveBeenCalledWith(
        file,
        user,
      );
    });
  });
});
