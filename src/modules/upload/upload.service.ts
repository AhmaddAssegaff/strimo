import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CHUNK_STATUS, UPLOAD_STATUS, VIDEO_STATUS } from '@prisma/client';
import { CompletedPart } from '@aws-sdk/client-s3';
import { v4 as uuidv4 } from 'uuid';

import { UploadRepository } from './upload.repository';
import { VideoRepository } from '../video/video.repository';
import { VideoStorageService } from '~app/core/object-storage/video-storage.service';
import { InitiateUploadDto, RecordChunkDto } from './dto/upload.dto';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { VIDEO_PROCESSING_QUEUE_NAME } from '~app/core/queue/queue.constant';
import {
  TranscodeJob,
  VIDEO_PROCESSING_JOB_NAME,
} from '~app/core/worker/video-worker/video-worker.constants';

@Injectable()
export class UploadService {
  constructor(
    private readonly uploadRepo: UploadRepository,
    private readonly videoRepo: VideoRepository,
    private readonly videoStorage: VideoStorageService,
    @InjectQueue(VIDEO_PROCESSING_QUEUE_NAME)
    private readonly videoProcessingQueue: Queue<TranscodeJob>,
  ) {}

  private async getValidUpload(uploadId: string, userId: string) {
    const upload = await this.uploadRepo.findUploadById(uploadId, userId);

    if (!upload) {
      throw new NotFoundException('Upload session not found');
    }

    if (upload.status === UPLOAD_STATUS.UPLOADED) {
      throw new BadRequestException('Upload is already completed');
    }

    if (upload.status === UPLOAD_STATUS.FAILED) {
      throw new BadRequestException(
        'Upload session was aborted or failed. Please re-initiate the upload.',
      );
    }

    return upload;
  }

  async initiateUpload(
    videoId: string,
    userId: string,
    channelId: string,
    dto: InitiateUploadDto,
  ) {
    const video = await this.videoRepo.selectUserVideoById(videoId, channelId);
    if (!video) throw new NotFoundException('Video not found');

    if (video.status !== VIDEO_STATUS.DRAFT) {
      throw new ConflictException('Video already uploading or published');
    }

    const uploadId = uuidv4();
    const chunkSize = this.videoStorage.calculateChunkSize(dto.sizeBytes);
    const totalChunks = Math.ceil(dto.sizeBytes / chunkSize);

    const storageInit = await this.videoStorage.initiateUpload(
      uploadId,
      dto.mimeType,
    );

    const upload = await this.uploadRepo.createUploadMultipart({
      userId,
      tempObjectKey: storageInit.objectKey,
      videoId,
      filename: dto.filename,
      mimeType: dto.mimeType,
      sizeBytes: dto.sizeBytes,
      chunkSize,
      totalChunks,
      multipartUploadId: storageInit.multipartUploadId,
      checksumSha256: dto.sha256Hex,
    });

    await this.videoRepo.updateStatusVideoById({
      videoId: video.id,
      channelId,
      status: VIDEO_STATUS.PROCESSING,
    });

    return {
      uploadId: upload.id,
      videoId: upload.videoId,
      multipartUploadId: upload.multipartUploadId,
      chunkSize,
      totalChunks: upload.totalChunks,
    };
  }

  async getPresignedUrlForChunk(
    userId: string,
    uploadId: string,
    chunkNumber: number,
  ) {
    const upload = await this.getValidUpload(uploadId, userId);

    const storageRes = await this.videoStorage.getChunkPresignedUrl(
      upload.tempObjectKey,
      upload.multipartUploadId,
      chunkNumber,
    );

    return {
      uploadId,
      chunkNumber: storageRes.partNumber,
      url: storageRes.url,
    };
  }

  async recordChunkSuccess(
    userId: string,
    uploadId: string,
    chunkNumber: number,
    dto: RecordChunkDto,
  ) {
    await this.getValidUpload(uploadId, userId);

    const chunk = await this.uploadRepo.recordChunkSuccessAndSetUploading({
      etag: dto.etag,
      sha256: dto.sha256Base64,
      chunkNumber: chunkNumber,
      uploadId: uploadId,
    });

    return {
      success: true,
      chunk: {
        uploadId: chunk.uploadId,
        chunkNumber: chunk.chunkNumber,
        etag: chunk.etag,
        byteOffset: Number(chunk.byteOffset),
        sizeBytes: Number(chunk.sizeBytes),
      },
    };
  }

  async getUploadStatus(userId: string, uploadId: string) {
    const upload = await this.getValidUpload(uploadId, userId);

    const uploadedChunkNumbers: number[] = [];
    const missingChunkNumbers: number[] = [];

    for (const chunk of upload.chunks) {
      if (chunk.status === CHUNK_STATUS.UPLOADED) {
        uploadedChunkNumbers.push(chunk.chunkNumber);
      } else {
        missingChunkNumbers.push(chunk.chunkNumber);
      }
    }

    return {
      uploadId: upload.id,
      videoId: upload.videoId,
      status: upload.status,
      filename: upload.filename,
      sizeBytes: Number(upload.sizeBytes),
      totalChunks: upload.totalChunks,
      uploadedChunksCount: uploadedChunkNumbers.length,
      uploadedChunkNumbers,
      missingChunkNumbers,
    };
  }

  async completeUpload(userId: string, channelId: string, uploadId: string) {
    const upload = await this.getValidUpload(uploadId, userId);

    const uploadedChunksCount = upload.chunks.length;

    if (uploadedChunksCount !== upload.totalChunks) {
      throw new BadRequestException(
        `Cannot complete. Uploaded ${uploadedChunksCount} of ${upload.totalChunks} chunks.`,
      );
    }

    const completedParts: CompletedPart[] = upload.chunks.map((chunk) => ({
      PartNumber: chunk.chunkNumber,
      ETag: chunk.etag!,
    }));

    await this.videoStorage.completeUpload(
      upload.tempObjectKey,
      upload.multipartUploadId,
      completedParts,
    );

    const preSignUrl = await this.videoStorage.getPresignedUrl(
      upload.tempObjectKey,
    );

    await this.uploadRepo.updateUploadStatus(uploadId, UPLOAD_STATUS.UPLOADED, {
      completedAt: new Date(),
    });

    const queue = await this.videoProcessingQueue.add(
      VIDEO_PROCESSING_JOB_NAME,
      {
        uploadId: upload.id,
        videoId: upload.videoId,
        preSignUrl,
        channelId: channelId,
      },
    );

    return {
      uploadId,
      videoId: upload.videoId,
      status: UPLOAD_STATUS.UPLOADED,
      queue: queue,
      message: 'Upload completed successfully',
    };
  }

  async abortUpload(userId: string, channelId: string, uploadId: string) {
    const upload = await this.getValidUpload(uploadId, userId);

    if (upload.multipartUploadId && upload.tempObjectKey) {
      await this.videoStorage.abortUpload(
        upload.tempObjectKey,
        upload.multipartUploadId,
      );
    }

    await this.uploadRepo.abortUploadTransaction({
      uploadId,
      videoId: upload.videoId,
      channelId,
    });

    return {
      uploadId,
      status: UPLOAD_STATUS.FAILED,
      message:
        'Upload session aborted and temporary data cleaned up successfully',
    };
  }
}
