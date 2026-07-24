import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from '../user.controller';
import { UserService } from '../user.service';
import { MockUserService } from './user.mock.test';
import { AuthenticatedUser } from '~app/modules/auth/auth.interface';
import { createMockUserService } from './user.factory.test';
import { UpdateUserProfile } from '../dto/update-user';

describe('UserController', () => {
  let controller: UserController;
  let service: MockUserService;

  beforeEach(async () => {
    service = createMockUserService();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        {
          provide: UserService,
          useValue: service,
        },
      ],
    }).compile();

    controller = module.get<UserController>(UserController);
  });

  describe('getUserProfile', () => {
    it('should only call UserService.findUserProfile', async () => {
      const user: AuthenticatedUser = {
        email: 'email@gmail.com',
        sub: 'a2802656-fe30-4a25-b469-859fb9bbb50d',
      };

      await controller.getUserProfile(user);

      expect(service.findUserProfile).toHaveBeenCalledTimes(1);
      expect(service.findUserProfile).toHaveBeenCalledWith(user);
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

      await controller.updateProfile(dto, user);

      expect(service.updateUserProfile).toHaveBeenCalledTimes(1);
      expect(service.updateUserProfile).toHaveBeenCalledWith(dto, user);
    });
  });

  describe('updateProfilePicture', () => {
    it('should only call UserService.updateUserProfilePicture', async () => {
      const user: AuthenticatedUser = {
        email: 'email@gmail.com',
        sub: 'a2802656-fe30-4a25-b469-859fb9bbb50d',
      };

      const file = {} as Express.Multer.File;

      await controller.updateProfilePicture(file, user);

      expect(service.updateUserProfilePicture).toHaveBeenCalledTimes(1);
      expect(service.updateUserProfilePicture).toHaveBeenCalledWith(file, user);
    });
  });
});
