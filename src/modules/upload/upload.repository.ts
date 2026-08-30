import { Injectable } from '@nestjs/common';
import { PrismaService } from '~app/infra/prisma/prisma.service';
import {
  CHUNK_STATUS,
  UPLOAD_STATUS,
  UPLOAD_TYPE,
  VIDEO_STATUS,
} from '@prisma/client';

@Injectable()
export class UploadRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findVideoForUser(videoId: string, userId: string) {
    return await this.prisma.video.findFirst({
      where: {
        id: videoId,
        channel: {
          userId: userId,
        },
      },
    });
  }

  async createUploadMultipart(params: {
    userId: string;
    tempObjectKey: string;
    videoId: string;
    filename: string;
    mimeType: string;
    sizeBytes: number;
    chunkSize: number;
    multipartUploadId: string;
    totalChunks: number;
  }) {
    const chunksData = Array.from(
      { length: params.totalChunks },
      (_, index) => {
        const chunkNumber = index + 1;
        const byteOffset = BigInt(index) * BigInt(params.chunkSize);

        const isLastChunk = chunkNumber === params.totalChunks;
        const currentSizeBytes = isLastChunk
          ? params.sizeBytes - Number(byteOffset)
          : params.chunkSize;

        return {
          chunkNumber,
          byteOffset,
          sizeBytes: currentSizeBytes,
          status: CHUNK_STATUS.PENDING,
        };
      },
    );

    return await this.prisma.upload.create({
      data: {
        userId: params.userId,
        tempObjectKey: params.tempObjectKey,
        videoId: params.videoId,
        filename: params.filename,
        mimeType: params.mimeType,
        sizeBytes: params.sizeBytes,
        chunkSize: params.chunkSize,
        uploadType: UPLOAD_TYPE.MULTIPART,
        status: UPLOAD_STATUS.PENDING,
        multipartUploadId: params.multipartUploadId,
        totalChunks: params.totalChunks,
        chunks: {
          createMany: {
            data: chunksData,
          },
        },
      },
      include: {
        chunks: true,
      },
    });
  }

  async findUploadWithUploadedChunks(uploadId: string, userId: string) {
    return this.prisma.upload.findFirst({
      where: { id: uploadId, userId },
      include: {
        chunks: {
          where: { status: CHUNK_STATUS.UPLOADED },
          orderBy: { chunkNumber: 'asc' },
          select: { chunkNumber: true, etag: true },
        },
      },
    });
  }

  async findUploadById(uploadId: string, userId: string) {
    return await this.prisma.upload.findUnique({
      where: { id: uploadId, userId: userId },
      include: {
        chunks: {
          orderBy: { chunkNumber: 'asc' },
        },
      },
    });
  }

  async updateUploadStatus(
    uploadId: string,
    status: UPLOAD_STATUS,
    extraData?: { completedAt?: Date; errorMessage?: string },
  ) {
    return await this.prisma.upload.update({
      where: { id: uploadId },
      data: {
        status,
        ...extraData,
      },
    });
  }

  async recordChunkSuccessAndSetUploading(params: {
    uploadId: string;
    chunkNumber: number;
    etag: string;
    sha256: string;
  }) {
    return this.prisma.uploadChunk.update({
      where: {
        uploadId_chunkNumber: {
          uploadId: params.uploadId,
          chunkNumber: params.chunkNumber,
        },
      },
      data: {
        etag: params.etag,
        sha256: params.sha256,
        status: CHUNK_STATUS.UPLOADED,
        upload: {
          update: {
            status: UPLOAD_STATUS.UPLOADING,
          },
        },
      },
    });
  }

  async abortUploadTransaction(params: {
    uploadId: string;
    videoId: string;
    channelId: string;
  }) {
    return this.prisma.$transaction([
      this.prisma.video.update({
        where: { id: params.videoId, channelId: params.channelId },
        data: { status: VIDEO_STATUS.DRAFT },
      }),
      this.prisma.upload.delete({
        where: { id: params.uploadId },
      }),
    ]);
  }
}
