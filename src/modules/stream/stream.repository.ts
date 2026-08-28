import { Injectable } from '@nestjs/common';
import { VIDEO_STATUS, VIDEO_VISIBILITY } from '@prisma/client';
import { PrismaService } from '~app/core/prisma/prisma.service';
import { VideoResult } from './interface/stream.interface';

@Injectable()
export class StreamRepository {
  constructor(private readonly prisma: PrismaService) {}

  async selectVideoPolicy(videoId: string): Promise<VideoResult | null> {
    return await this.prisma.video.findUnique({
      where: {
        id: videoId,
        status: VIDEO_STATUS.READY,
        visibility: VIDEO_VISIBILITY.PUBLIC,
      },
      select: {
        status: true,
        visibility: true,
      },
    });
  }
}
