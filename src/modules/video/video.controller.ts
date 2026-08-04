import {
  Controller,
  Post,
  Body,
  UseGuards,
  Get,
  Query,
  Put,
  Param,
} from '@nestjs/common';
import { VideoService } from './video.service';
import { CreateVideoDto } from './dto/create-video.dto';
import { JwtAccessGuard } from '../auth/guard/jwt-access.guard';
import { CurrentUser } from '~app/core/decorators/current-user.decorators';
import type { AuthenticatedUser } from '../auth/interface/auth.interface';
import { GetVideosDto } from './dto/get-videos.dto';
import { UpdateVideoDto } from './dto/update-video.dto';
import { VideoResult, VideosResult } from './interface/video.interface';

@Controller('video')
export class VideoController {
  constructor(private readonly videoService: VideoService) {}

  @Post()
  @UseGuards(JwtAccessGuard)
  postVideo(
    @CurrentUser() user: AuthenticatedUser,
    @Body() createVideoDto: CreateVideoDto,
  ): Promise<VideoResult> {
    return this.videoService.createVideo(user.channelId, createVideoDto);
  }

  @Get('me')
  @UseGuards(JwtAccessGuard)
  getUserVideos(
    @CurrentUser() user: AuthenticatedUser,
    @Query() getVideosDto: GetVideosDto,
  ): Promise<VideosResult> {
    return this.videoService.findUserVideos(user.channelId, getVideosDto);
  }

  @Put(':videoId')
  @UseGuards(JwtAccessGuard)
  putVideo(
    @CurrentUser() user: AuthenticatedUser,
    @Param('videoId') videoId: string,
    @Body() updateVideoDto: UpdateVideoDto,
  ): Promise<VideoResult> {
    return this.videoService.updateUserVideos(
      videoId,
      user.channelId,
      updateVideoDto,
    );
  }
}
