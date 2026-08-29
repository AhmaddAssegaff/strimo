import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from '../user.controller';

describe('UserController', () => {
  let _userController: UserController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [],
    }).compile();

    _userController = module.get<UserController>(UserController);
  });

  describe.skip('UserController', () => {});
});
