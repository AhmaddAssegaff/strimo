import { PrismaService } from '~app/core/prisma/prisma.service';
import { CreateVideoDto } from './dto/create-video.dto';
import { Injectable } from '@nestjs/common';
import { Prisma, UPLOAD_TYPE } from '@prisma/client';

@Injectable()
export class VideoRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findChannel(userId: string) {
    return await this.prisma.channel.findUnique({
      where: {
        userId: userId,
      },
      select: {
        id: true,
      },
    });
  }

  async createVideo(
    createVideoDto: CreateVideoDto,
    channelId: string,
    userId: string,
  ) {
    const { filename, mimeType, sizeBytes, description, title } =
      createVideoDto;

    return await this.prisma.$transaction(async (tx) => {
      const video = await tx.video.create({
        data: {
          channelId: channelId,
          description: description,
          title: title,
        },
      });

      const upload = await tx.upload.create({
        data: {
          userId: userId,
          videoId: video.id,
          filename: filename,
          mimeType: mimeType,
          sizeBytes: sizeBytes,
          uploadType: UPLOAD_TYPE.MULTIPART,
        },
      });

      return {
        video,
        upload,
      };
    });
  }

  async updateUpload(uploadId: string, data: Prisma.UploadUpdateInput) {
    return await this.prisma.upload.update({
      where: {
        id: uploadId,
      },
      data,
    });
  }
}
