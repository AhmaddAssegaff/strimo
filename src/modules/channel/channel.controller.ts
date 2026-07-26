import { Controller, Post, Body, Put, UseGuards } from '@nestjs/common';
import { ChannelService } from './channel.service';
import { CreateChannelDto } from './dto/create-channel.dto';
import { UpdateChannelDto } from './dto/update-channel.dto';
import { ChannelResult } from './interface/channel.interface';
import { CurrentUser } from '~app/core/decorators/current-user.decorators';
import type { AuthenticatedUser } from '../auth/interface/auth.interface';
import { JwtAccessGuard } from '../auth/guard/jwt-access.guard';

@UseGuards(JwtAccessGuard)
@Controller('channel')
export class ChannelController {
  constructor(private readonly channelService: ChannelService) {}

  @Post()
  postChannel(
    @CurrentUser() user: AuthenticatedUser,
    @Body() createChannelDto: CreateChannelDto,
  ): Promise<ChannelResult> {
    return this.channelService.createChannel(user, createChannelDto);
  }

  @Put()
  putChannel(
    @CurrentUser() user: AuthenticatedUser,
    @Body() updateChannelDto: UpdateChannelDto,
  ): Promise<ChannelResult> {
    return this.channelService.updateChannel(user, updateChannelDto);
  }
}
