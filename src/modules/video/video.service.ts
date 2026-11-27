import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateVideoDto } from './dto/create-video.dto';
import { VideoRepository } from './video.repository';
import { GetVideosDto } from './dto/get-videos.dto';
import { UpdateVideoDto } from './dto/update-video.dto';
import { VideoResult, VideosResult } from './interface/video.interface';
import { CACHE_KEY } from '~app/infra/redis/redis.constants';
import { RedisService } from '~app/infra/redis/redis.service';

@Injectable()
export class VideoService {
  constructor(
    private readonly redis: RedisService,
    private readonly videoRepo: VideoRepository,
  ) {}

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
    const cache = CACHE_KEY.video.session(videoId);

    const updatedVideo = await this.videoRepo.updateVideo(
      videoId,
      channelId,
      updateVideoDto,
    );

    if (!updatedVideo) {
      throw new NotFoundException('video not found');
    }

    this.redis.del(cache.key);

    return updatedVideo;
  }
}
