import { Test, TestingModule } from '@nestjs/testing';
import { ChannelController } from '../channel.controller';
import { ChannelService } from '../channel.service';
import { createMockChannelService } from './channel.factory.mock';
import { MockChannelService } from './channel.type.mock';
import { AuthenticatedUser } from '~app/modules/auth/interface/auth.interface';
import { UpdateChannelDto } from '../dto/update-channel.dto';
import { CreateChannelDto } from '../dto/create-channel.dto';

describe('ChannelController', () => {
  let controller: ChannelController;
  let service: MockChannelService;

  beforeEach(async () => {
    service = createMockChannelService();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ChannelController],
      providers: [
        ChannelService,
        {
          provide: ChannelService,
          useValue: service,
        },
      ],
    }).compile();

    controller = module.get<ChannelController>(ChannelController);
  });

  describe('getUserChannel', () => {
    it('should only call channelService.findChannelById with user authenticated user', async () => {
      const user: AuthenticatedUser = {
        sub: 'b7b43827-6283-456f-a333-627881a57425',
        email: 'email@email.com',
      };

      await controller.getUserChannel(user);

      expect(service.findChannelById).toHaveBeenCalledTimes(1);
      expect(service.findChannelById).toHaveBeenCalledWith(user.sub);
    });
  });

  describe('getChannel', () => {
    it('should only call channelService.findChannelById with params', async () => {
      const channelId: string = '72ce86cc-6d93-4397-ab42-38df7f2793e8';

      await controller.getChannel(channelId);

      expect(service.findChannelById).toHaveBeenCalledTimes(1);
      expect(service.findChannelById).toHaveBeenCalledWith(channelId);
    });
  });

  describe('postChannel', () => {
    it('should only call channelService.createChannel with dto', async () => {
      const user: AuthenticatedUser = {
        sub: 'b7b43827-6283-456f-a333-627881a57425',
        email: 'email@email.com',
      };
      const dto: CreateChannelDto = {
        description: 'desc',
        title: 'title',
      };

      await controller.postChannel(user, dto);

      expect(service.createChannel).toHaveBeenCalledTimes(1);
      expect(service.createChannel).toHaveBeenCalledWith(user, dto);
    });
  });

  describe('putChannel', () => {
    it('should only call channelService.updateChannel', async () => {
      const user: AuthenticatedUser = {
        sub: 'b7b43827-6283-456f-a333-627881a57425',
        email: 'email@email.com',
      };
      const dto: UpdateChannelDto = {
        description: 'desc',
        title: 'title',
      };

      await controller.putChannel(user, dto);

      expect(service.updateChannel).toHaveBeenCalledTimes(1);
      expect(service.updateChannel).toHaveBeenCalledWith(user, dto);
    });
  });

  describe('patchChannelBanner', () => {
    it('should only call channelService.updateChannelBanner with user authenticated and file', async () => {
      const file = {} as Express.Multer.File;
      const user: AuthenticatedUser = {
        sub: 'b7b43827-6283-456f-a333-627881a57425',
        email: 'email@email.com',
      };

      await controller.patchChannelBanner(user, file);

      expect(service.updateChannelBanner).toHaveBeenCalledTimes(1);
      expect(service.updateChannelBanner).toHaveBeenCalledWith(user, file);
    });
  });

  describe('patchChannelAvatar', () => {
    it('should only call channelService.updateChannelAvatar with user authenticated and file', async () => {
      const file = {} as Express.Multer.File;
      const user: AuthenticatedUser = {
        sub: 'b7b43827-6283-456f-a333-627881a57425',
        email: 'email@email.com',
      };

      await controller.patchChannelAvatar(user, file);

      expect(service.updateChannelAvatar).toHaveBeenCalledTimes(1);
      expect(service.updateChannelAvatar).toHaveBeenCalledWith(user, file);
    });
  });
});
