import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { VideoService } from './video.service';
import { CreateVideoDto } from './dto/create-video.dto';
import { JwtAccessGuard } from '../auth/guard/jwt-access.guard';
import { CurrentUser } from '~app/core/decorators/current-user.decorators';
import type { AuthenticatedUser } from '../auth/interface/auth.interface';

@Controller('video')
export class VideoController {
  constructor(private readonly videoService: VideoService) {}

  @Post('uploads/initiate')
  @UseGuards(JwtAccessGuard)
  initiateUpload(
    @Body() createVideoDto: CreateVideoDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.videoService.createInitUploadVideo(createVideoDto, user);
  }
}
