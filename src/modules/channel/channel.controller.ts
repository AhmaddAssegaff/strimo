import {
  Controller,
  Post,
  Body,
  Put,
  UseGuards,
  Get,
  Param,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ChannelService } from './channel.service';
import { CreateChannelDto } from './dto/create-channel.dto';
import { UpdateChannelDto } from './dto/update-channel.dto';
import { ChannelResult } from './interface/channel.interface';
import { CurrentUser } from '~app/core/decorators/current-user.decorators';
import type { AuthenticatedUser } from '../auth/interface/auth.interface';
import { JwtAccessGuard } from '../auth/guard/jwt-access.guard';

@Controller('channel')
export class ChannelController {
  constructor(private readonly channelService: ChannelService) {}

  @Get('me')
  @UseGuards(JwtAccessGuard)
  getUserChannel(
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<ChannelResult> {
    return this.channelService.findChannelById(user.sub);
  }

  @Get(':channelId')
  getChannel(
    @Param('channelId', ParseUUIDPipe) channelId: string,
  ): Promise<ChannelResult> {
    return this.channelService.findChannelById(channelId);
  }

  @Post()
  @UseGuards(JwtAccessGuard)
  postChannel(
    @CurrentUser() user: AuthenticatedUser,
    @Body() createChannelDto: CreateChannelDto,
  ): Promise<ChannelResult> {
    return this.channelService.createChannel(user, createChannelDto);
  }

  @Put()
  @UseGuards(JwtAccessGuard)
  putChannel(
    @CurrentUser() user: AuthenticatedUser,
    @Body() updateChannelDto: UpdateChannelDto,
  ): Promise<ChannelResult> {
    return this.channelService.updateChannel(user, updateChannelDto);
  }
}
