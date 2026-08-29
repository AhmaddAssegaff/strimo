import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { UploadService } from './upload.service';
import { InitiateUploadDto, RecordChunkDto } from './dto/upload.dto';
import { JwtAccessGuard } from '../auth/guard/jwt-access.guard';
import { CurrentUser } from '~app/core/decorators/current-user.decorators';
import type { AuthenticatedUser } from '../auth/interface/auth.interface';

@Controller('uploads')
@UseGuards(JwtAccessGuard)
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Post('initiate/:videoId')
  async initiate(
    @Param('videoId') videoId: string,
    @CurrentUser() user: AuthenticatedUser,
    @Body() initiateUploadDto: InitiateUploadDto,
  ) {
    return await this.uploadService.initiateUpload(
      videoId,
      user.sub,
      user.channelId,
      initiateUploadDto,
    );
  }

  @Get('presigned-url/:uploadId')
  async getPresignedUrl(
    @CurrentUser() user: AuthenticatedUser,
    @Param('uploadId') uploadId: string,
    @Query('chunkNumber', ParseIntPipe) chunkNumber: number,
  ) {
    return await this.uploadService.getPresignedUrlForChunk(
      user.sub,
      uploadId,
      chunkNumber,
    );
  }

  @Patch('chunks/:uploadId')
  async recordChunk(
    @CurrentUser() user: AuthenticatedUser,
    @Param('uploadId') uploadId: string,
    @Query('chunkNumber', ParseIntPipe) chunkNumber: number,
    @Body() dto: RecordChunkDto,
  ) {
    return await this.uploadService.recordChunkSuccess(
      user.sub,
      uploadId,
      chunkNumber,
      dto,
    );
  }

  @Get('status/:uploadId')
  async getStatus(
    @CurrentUser() user: AuthenticatedUser,
    @Param('uploadId') uploadId: string,
  ) {
    return await this.uploadService.getUploadStatus(user.sub, uploadId);
  }

  @Post('complete/:uploadId')
  async complete(
    @CurrentUser() user: AuthenticatedUser,
    @Param('uploadId') uploadId: string,
  ) {
    return await this.uploadService.completeUpload(
      user.sub,
      user.channelId,
      uploadId,
    );
  }

  @Delete('abort/:uploadId')
  async abort(
    @CurrentUser() user: AuthenticatedUser,
    @Param('uploadId') uploadId: string,
  ) {
    return await this.uploadService.abortUpload(
      user.sub,
      user.channelId,
      uploadId,
    );
  }
}
