import { PrismaService } from '~app/infra/prisma/prisma.service';
import { CreateVideoDto } from './dto/create-video.dto';
import { Injectable } from '@nestjs/common';
import { GetVideosDto } from './dto/get-videos.dto';
import { Prisma, VIDEO_STATUS, VIDEO_VISIBILITY } from '@prisma/client';
import { UpdateVideoDto } from './dto/update-video.dto';
import {
  VideoAndUploadResult,
  VideoResult,
  VideosResult,
} from './interface/video.interface';

@Injectable()
export class VideoRepository {
  constructor(private readonly prisma: PrismaService) {}

  async insertVideo(
    createVideoDto: CreateVideoDto,
    channelId: string,
  ): Promise<VideoResult> {
    const video = await this.prisma.video.create({
      data: {
        channelId: channelId,
        description: createVideoDto.description,
        title: createVideoDto.title,
        status: VIDEO_STATUS.DRAFT,
        visibility: VIDEO_VISIBILITY.PRIVATE,
      },
    });

    return video;
  }

  async selectUserVideosByChannelId(
    channelId: string,
    dto: GetVideosDto,
  ): Promise<VideosResult> {
    const skip = (dto.page - 1) * dto.limit;

    const where: Prisma.VideoWhereInput = {
      channelId,
      visibility: dto.visibility,
      status: dto.status,
    };

    if (dto.search) {
      where.OR = [
        {
          title: {
            contains: dto.search,
            mode: Prisma.QueryMode.insensitive,
          },
        },
        {
          description: {
            contains: dto.search,
            mode: Prisma.QueryMode.insensitive,
          },
        },
      ];
    }

    return this.prisma.video.findMany({
      where,
      skip,
      take: dto.limit,
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async updateVideo(
    videoId: string,
    channelId: string,
    updateVideoDto: UpdateVideoDto,
  ): Promise<VideoResult> {
    const video = await this.prisma.video.update({
      where: {
        id: videoId,
        channelId: channelId,
      },
      data: updateVideoDto,
    });

    return video;
  }

  async selectUserVideoById(
    videoId: string,
    channelId: string,
  ): Promise<VideoAndUploadResult | null> {
    return await this.prisma.video.findFirst({
      where: {
        id: videoId,
        channelId: channelId,
      },
      include: {
        uploads: {
          select: {
            completedAt: true,
          },
        },
      },
    });
  }

  async updateStatusVideoById(data: {
    videoId: string;
    channelId: string;
    status: VIDEO_STATUS;
  }): Promise<VideoResult> {
    return await this.prisma.video.update({
      where: {
        id: data.videoId,
        channelId: data.channelId,
      },
      data: {
        status: data.status,
      },
    });
  }

  async updateProcessedVideoById(data: {
    videoId: string;
    channelId: string;
    status: VIDEO_STATUS;
    dashKey: string;
    hlsKey: string;
    thumbnailKey: string;
  }): Promise<VideoResult> {
    return await this.prisma.video.update({
      where: {
        id: data.videoId,
        channelId: data.channelId,
      },
      data: {
        status: data.status,
        hlsKey: data.hlsKey,
        dashKey: data.dashKey,
        thumbnail: data.thumbnailKey,
      },
    });
  }
}
