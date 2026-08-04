import { Test, TestingModule } from '@nestjs/testing';
import { ChannelController } from '../channel.controller';
import { ChannelService } from '../channel.service';

describe('ChannelController', () => {
  let _controller: ChannelController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ChannelController],
      providers: [ChannelService],
    }).compile();

    _controller = module.get<ChannelController>(ChannelController);
  });
});
