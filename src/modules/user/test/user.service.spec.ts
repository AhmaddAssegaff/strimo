import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from '../user.service';

describe('UserService', () => {
  let _userService: UserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UserService],
    }).compile();

    _userService = module.get<UserService>(UserService);
  });

  describe.skip('UserService', () => {});
});
