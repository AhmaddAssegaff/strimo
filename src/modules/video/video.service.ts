import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateVideoDto } from './dto/create-video.dto';
import { VideoRepository } from './video.repository';
import { AuthenticatedUser } from '../auth/interface/auth.interface';
import { VideoStorageService } from '~app/core/object-storage/video-storage.service';
import { UPLOAD_STATUS } from '@prisma/client';

@Injectable()
export class VideoService {
  constructor(
    private readonly videoRepo: VideoRepository,
    private readonly storageVideo: VideoStorageService,
  ) {}

  async createInitUploadVideo(
    createVideoDto: CreateVideoDto,
    user: AuthenticatedUser,
  ) {
    const channel = await this.videoRepo.findChannel(user.sub);

    if (!channel) {
      throw new NotFoundException('channel not found');
    }

    const { upload } = await this.videoRepo.createVideo(
      createVideoDto,
      channel.id,
      user.sub,
    );
    const { id: uploadId, mimeType } = upload;

    const result = await this.storageVideo.initiateUpload(uploadId, mimeType);

    await this.videoRepo.updateUpload(upload.id, {
      multipartUploadId: result.multipartUploadId,
      stagingKey: result.objectKey,
      status: UPLOAD_STATUS.UPLOADING,
    });

    return result;
  }
}
