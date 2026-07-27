import {
  Controller,
  Post,
  Body,
  Put,
  UseGuards,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { ChannelService } from './channel.service';
import { CreateChannelDto } from './dto/create-channel.dto';
import { UpdateChannelDto } from './dto/update-channel.dto';
import { ChannelResult } from './interface/channel.interface';
import { CurrentUser } from '~app/core/decorators/current-user.decorators';
import type { AuthenticatedUser } from '../auth/interface/auth.interface';
import { JwtAccessGuard } from '../auth/guard/jwt-access.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { FILE_RULES } from '~app/core/pipes/file-upload/file-upload.constant';
import { FileUploadPipe } from '~app/core/pipes/file-upload/file-upload.pipe';

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

  @Patch('banner')
  @UseGuards(JwtAccessGuard)
  @UseInterceptors(FileInterceptor('banner'))
  patchChannelBanner(
    @CurrentUser() user: AuthenticatedUser,
    @UploadedFile(FileUploadPipe(FILE_RULES.banner))
    file: Express.Multer.File,
  ): Promise<ChannelResult> {
    return this.channelService.updateChannelBanner(user, file);
  }

  @Patch('avatar')
  @UseGuards(JwtAccessGuard)
  @UseInterceptors(FileInterceptor('avatar'))
  patchChannelAvatar(
    @CurrentUser() user: AuthenticatedUser,
    @UploadedFile(FileUploadPipe(FILE_RULES.avatar))
    file: Express.Multer.File,
  ): Promise<ChannelResult> {
    return this.channelService.updateChannelAvatar(user, file);
  }
}
