import { Test, TestingModule } from '@nestjs/testing';
import { ChannelService } from '../channel.service';

describe('ChannelService', () => {
  let _service: ChannelService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ChannelService],
    }).compile();

    _service = module.get<ChannelService>(ChannelService);
  });
});
