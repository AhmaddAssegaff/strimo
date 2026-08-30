import { OnWorkerEvent, Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { FfmpegService } from '~app/core/ffmpeg/ffmpeg.service';
import { FfprobeService } from '~app/core/ffprobe/ffprobe.service';
import { VIDEO_PROCESSING_QUEUE_NAME } from '~app/core/queue/queue.constant';
import { TranscodeJob } from './video-worker.constants';
import { ShakaPackagerService } from '~app/core/shaka-packager/shaka-packager.service';
import * as path from 'node:path';
import { mkdir, readdir } from 'node:fs/promises';
import { PinoLogger } from 'nestjs-pino';
import { lookup } from 'mime-types';
import { VideoRepository } from '~app/modules/video/video.repository';
import { VIDEO_STATUS } from '@prisma/client';
import {
  THUMNAIL_VIDEO_BUCKET_NAME,
  VIDEO_BUCKET_NAME,
} from '~app/infra/object-storage/object-storage.constants';
import { VideoStorageService } from '~app/core/storage/video/video-storage.service';

@Processor(VIDEO_PROCESSING_QUEUE_NAME)
export class VideoTranscodingWorker extends WorkerHost {
  constructor(
    private readonly ffmpeg: FfmpegService,
    private readonly ffprobe: FfprobeService,
    private readonly shakaPackager: ShakaPackagerService,
    private readonly videoStorage: VideoStorageService,
    private readonly pino: PinoLogger,
    private readonly videoRepo: VideoRepository,
  ) {
    super();
  }

  private getContentType(filePath: string): string {
    return lookup(filePath) || 'application/octet-stream';
  }

  private async getPackedFiles(packedDir: string): Promise<string[]> {
    const entries = await readdir(packedDir, { withFileTypes: true });
    return entries
      .filter((entry) => entry.isFile())
      .map((entry) => path.join(packedDir, entry.name));
  }

  private async uploadPackedDirectory(
    packedDir: string,
    videoId: string,
  ): Promise<void> {
    const files = await this.getPackedFiles(packedDir);

    await Promise.all(
      files.map(async (filePath) => {
        const relativePath = path.relative(packedDir, filePath);

        const objectKey = path
          .join(videoId, relativePath)
          .replaceAll(path.sep, '/');

        const contentType = this.getContentType(filePath);

        await this.videoStorage.uploadPackedFile({
          objectKey,
          filePath,
          contentType,
        });

        this.pino.info(
          `[VIDEO_WORKER] Uploaded packed file | videoId=${videoId} | key=${objectKey}`,
        );
      }),
    );
  }

  async process(job: Job<TranscodeJob>): Promise<void> {
    const metadata = await this.ffprobe.getVideoMetadata(job.data.preSignUrl);

    const workDir = path.join(process.cwd(), '.temp', job.data.videoId);

    const transcodedVideoDir = path.join(workDir, 'transcoded');
    const packedDir = path.join(workDir, 'packed');

    await mkdir(transcodedVideoDir, { recursive: true });
    await mkdir(packedDir, { recursive: true });

    const transcoder = await this.ffmpeg.transcodeVideo({
      preSignUrl: job.data.preSignUrl,
      outputDirectory: transcodedVideoDir,
      metadata: metadata,
    });

    const packager = await this.shakaPackager.pack({
      inputDirectory: transcodedVideoDir,
      outputDirectory: packedDir,
    });

    if (metadata.video.height >= 1080) {
      await transcoder.toMax1080();
      await packager.toMax1080();
    } else if (metadata.video.height >= 720) {
      await transcoder.toMax720();
      await packager.toMax720();
    } else if (metadata.video.height >= 480) {
      await transcoder.toMax480();
      await packager.toMax480();
    } else if (metadata.video.height >= 360) {
      await transcoder.toMax360();
      await packager.toMax360();
    } else if (metadata.video.height >= 144) {
      await transcoder.toMax144();
      await packager.toMax144();
    } else {
      await transcoder.toMax144();
      await packager.toMax144();
    }

    // TODO: generate video thumnail and upload to s3 with `thumbnailKey`

    await this.uploadPackedDirectory(packedDir, job.data.videoId);

    const dashKey = `${VIDEO_BUCKET_NAME}/${job.data.videoId}/manifest.mpd`;
    const hlsKey = `${VIDEO_BUCKET_NAME}/${job.data.videoId}/master.m3u8`;
    const thumbnailKey = `${THUMNAIL_VIDEO_BUCKET_NAME}/${job.data.videoId}/thumnail.png`;

    await this.videoRepo.updateProcessedVideoById({
      videoId: job.data.videoId,
      status: VIDEO_STATUS.READY,
      channelId: job.data.channelId,
      dashKey: dashKey,
      hlsKey: hlsKey,
      thumbnailKey: thumbnailKey,
    });
  }

  @OnWorkerEvent('completed')
  onCompleted(job: Job<TranscodeJob>) {
    this.pino.info(
      `[VIDEO_WORKER] Job completed | jobId=${job.id} | videoId=${job.data.videoId}`,
    );
  }

  @OnWorkerEvent('active')
  onActive(job: Job<TranscodeJob>) {
    this.pino.info(
      `[VIDEO_WORKER] Job started | jobId=${job.id} | videoId=${job.data.videoId}`,
    );
  }

  @OnWorkerEvent('failed')
  onFailed(job: Job<TranscodeJob>) {
    this.pino.error(
      `[VIDEO_WORKER] Job failed | jobId=${job.id} | videoId=${job.data.videoId}`,
    );
  }

  @OnWorkerEvent('stalled')
  onStalled(jobId: string) {
    this.pino.warn(`[VIDEO_WORKER] Job stalled | jobId=${jobId}`);
  }

  @OnWorkerEvent('ready')
  onReady() {
    this.pino.info(
      `[VIDEO_WORKER] Worker ready | queue=${VIDEO_PROCESSING_QUEUE_NAME}`,
    );
  }
}
