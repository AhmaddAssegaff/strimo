import { PrismaService } from '~app/core/prisma/prisma.service';
import { CreateVideoDto } from './dto/create-video.dto';
import { Injectable } from '@nestjs/common';
import { GetVideosDto } from './dto/get-videos.dto';
import { Prisma, VIDEO_STATUS, VIDEO_VISIBILITY } from '@prisma/client';
import { UpdateVideoDto } from './dto/update-video.dto';
import { VideoResult, VideosResult } from './interface/video.interface';

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

    return {
      video: video,
    };
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

    const [videos, total] = await this.prisma.$transaction([
      this.prisma.video.findMany({
        where,
        skip,
        take: dto.limit,
        orderBy: {
          createdAt: 'desc',
        },
      }),
      this.prisma.video.count({
        where,
      }),
    ]);

    return {
      videos: videos,
      meta: {
        page: dto.page,
        limit: dto.limit,
        total,
        totalPages: Math.ceil(total / dto.limit),
      },
    };
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

    return {
      video: video,
    };
  }
}
