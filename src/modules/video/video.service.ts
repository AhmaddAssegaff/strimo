import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateVideoDto } from './dto/create-video.dto';
import { VideoRepository } from './video.repository';
import { GetVideosDto } from './dto/get-videos.dto';
import { UpdateVideoDto } from './dto/update-video.dto';
import { VideoResult, VideosResult } from './interface/video.interface';

@Injectable()
export class VideoService {
  constructor(private readonly videoRepo: VideoRepository) {}

  async createVideo(
    channelId: string,
    createVideoDto: CreateVideoDto,
  ): Promise<VideoResult> {
    return await this.videoRepo.insertVideo(createVideoDto, channelId);
  }

  async findUserVideos(
    channelId: string,
    getVideosDto: GetVideosDto,
  ): Promise<VideosResult> {
    return await this.videoRepo.selectUserVideosByChannelId(
      channelId,
      getVideosDto,
    );
  }

  async updateUserVideos(
    videoId: string,
    channelId: string,
    updateVideoDto: UpdateVideoDto,
  ): Promise<VideoResult> {
    const updatedVideo = await this.videoRepo.updateVideo(
      videoId,
      channelId,
      updateVideoDto,
    );

    if (!updatedVideo) {
      throw new NotFoundException('video not found');
    }

    return updatedVideo;
  }
}
