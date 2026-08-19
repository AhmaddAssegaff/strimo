/* eslint-disable @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call */
import * as path from 'node:path';
import { spawn } from 'node:child_process';
import { mkdir } from 'node:fs/promises';
import { PinoLogger } from 'nestjs-pino';
import { Injectable } from '@nestjs/common';
import { VideoMetadata } from '../ffprobe/ffprobe.interface';

/**
 * Transcodes a video into multiple adaptive bitrate variants using FFmpeg.
 *
 * The maximum output resolution is selected by the worker based on the
 * original video's height:
 *
 * - 144p  -> 256x144
 * - 360p  -> 640x360
 * - 480p  -> 854x480
 * - 720p  -> 1280x720
 * - 1080p -> 1920x1080
 *
 * Video bitrate is dynamically capped by the original video's bitrate.
 * This prevents a generated video variant from using a higher bitrate
 * than the source video.
 *
 * Audio bitrate is also dynamically capped by the original audio bitrate.
 *
 * Video:
 * - Codec: H.264 (libopenh264)
 * - Pixel format: yuv420p
 * - GOP/keyframe interval: 48 frames
 *
 * Audio:
 * - Codec: AAC
 * - Stored separately as audio/audio.mp4
 *
 * CLI equivalent for a 720p source:
 *
 * ```bash
 * ffmpeg -y \
 *   -i input.mp4 \
 *   -filter_complex "
 *     [0:v]split=4[v144][v360][v480][v720];
 *     [v144]scale=w=256:h=144unsharp=5:5:0.8:5:5:0.0[out144];
 *     [v360]scale=w=640:h=360unsharp=5:5:0.8:5:5:0.0[out360];
 *     [v480]scale=w=854:h=480unsharp=5:5:0.8:5:5:0.0[out480];
 *     [v720]scale=w=1280:h=720unsharp=5:5:0.8:5:5:0.0[out720]
 *   " \
 *
 *   -map "[out144]" \
 *   -c:v libopenh264 \
 *   -b:v 500k \
 *   -pix_fmt yuv420p \
 *   -g 48 \
 *   -keyint_min 48 \
 *   -an \
 *   output/video/144/video.mp4 \
 *
 *   -map "[out360]" \
 *   -c:v libopenh264 \
 *   -b:v 1500k \
 *   -pix_fmt yuv420p \
 *   -g 48 \
 *   -keyint_min 48 \
 *   -an \
 *   output/video/360/video.mp4 \
 *
 *   -map "[out480]" \
 *   -c:v libopenh264 \
 *   -b:v 3000k \
 *   -pix_fmt yuv420p \
 *   -g 48 \
 *   -keyint_min 48 \
 *   -an \
 *   output/video/480/video.mp4 \
 *
 *   -map "[out720]" \
 *   -c:v libopenh264 \
 *   -b:v 6000k \
 *   -pix_fmt yuv420p \
 *   -g 48 \
 *   -keyint_min 48 \
 *   -an \
 *   output/video/720/video.mp4 \
 *
 *   -map 0:a? \
 *   -c:a aac \
 *   -b:a 128k \
 *   output/audio/audio.mp4
 * ```
 *
 * Note:
 * The bitrates shown in the CLI example are maximum target bitrates.
 * The actual bitrate used by the service may be lower depending on the
 * original video's video and audio bitrates.
 *
 * Output structure:
 *
 * transcoded/
 * ├── audio/
 * │   └── audio.mp4
 * └── video/
 *     ├── 144/
 *     │   └── video.mp4
 *     ├── 360/
 *     │   └── video.mp4
 *     ├── 480/
 *     │   └── video.mp4
 *     ├── 720/
 *     │   └── video.mp4
 *     └── 1080/
 *         └── video.mp4
 */

type Resolution = 144 | 360 | 480 | 720 | 1080;
const RESOLUTIONS: Resolution[] = [144, 360, 480, 720, 1080];

@Injectable()
export class FfmpegService {
  constructor(private readonly pino: PinoLogger) {}

  private runFfmpegArgs(args: string[]): Promise<void> {
    return new Promise((resolve, reject) => {
      const ffmpeg = spawn('ffmpeg', args);

      let stderrData = '';
      ffmpeg.stderr.on('data', (data) => {
        stderrData += data.toString();
      });

      ffmpeg.on('error', (error) => {
        this.pino.error('ffmpeg error', error);
        reject(error);
      });

      ffmpeg.on('close', (code) => {
        if (code === 0) {
          resolve();
          return;
        }

        this.pino.error(`FFmpeg exited with code ${code}: ${stderrData}`);
        reject(new Error(`FFmpeg exited with code ${code}: ${stderrData}`));
      });
    });
  }

  private async prepareOutputDirectories(
    outputDirectory: string,
    resolutions: number[],
  ): Promise<void> {
    await mkdir(path.join(outputDirectory, 'audio'), {
      recursive: true,
    });

    await Promise.all(
      resolutions.map((resolution) =>
        mkdir(path.join(outputDirectory, 'video', String(resolution)), {
          recursive: true,
        }),
      ),
    );
  }

  private generateVideoBitrate(params: {
    targetMaxKbps: number;
    originalBps: number | null;
  }): string {
    if (!params.originalBps) {
      return `${params.targetMaxKbps}k`;
    }

    const originalKbps = Math.round(params.originalBps / 1000);

    return `${Math.min(params.targetMaxKbps, originalKbps)}k`;
  }

  private generateAudioBitrate(
    targetKbps: number,
    originalBps: number | null,
  ): string {
    if (!originalBps) {
      return `${targetKbps}k`;
    }

    const originalKbps = Math.round(originalBps / 1000);

    return `${Math.min(targetKbps, originalKbps)}k`;
  }

  private mapStream(
    label: string,
    bitrate: string,
    outputDirectory: string,
    resolution: number,
  ): string[] {
    return [
      '-map',
      `[${label}]`,
      '-c:v',
      'libopenh264',
      '-b:v',
      bitrate,
      '-pix_fmt',
      'yuv420p',
      '-g',
      '48',
      '-keyint_min',
      '48',
      '-an',
      path.join(outputDirectory, 'video', String(resolution), 'video.mp4'),
    ];
  }

  private mapAudio(bitrate: string, outputDirectory: string): string[] {
    return [
      '-map',
      '0:a?',
      '-c:a',
      'aac',
      '-b:a',
      bitrate,
      path.join(outputDirectory, 'audio', 'audio.mp4'),
    ];
  }

  async transcodeVideo(params: {
    preSignUrl: string;
    outputDirectory: string;
    metadata: VideoMetadata;
  }) {
    const { preSignUrl, outputDirectory, metadata } = params;
    const { video, audio } = metadata;

    const MAX_KBPS_144P = 500;
    const MAX_KBPS_360P = 1500;
    const MAX_KBPS_480P = 3000;
    const MAX_KBPS_720P = 6000;
    const MAX_KBPS_1080P = 10000;

    const videoBitRate144p = this.generateVideoBitrate({
      originalBps: video.bitRate,
      targetMaxKbps: MAX_KBPS_144P,
    });

    const videoBitRate360p = this.generateVideoBitrate({
      originalBps: video.bitRate,
      targetMaxKbps: MAX_KBPS_360P,
    });

    const videoBitRate480p = this.generateVideoBitrate({
      originalBps: video.bitRate,
      targetMaxKbps: MAX_KBPS_480P,
    });

    const VideoBitRate720p = this.generateVideoBitrate({
      originalBps: video.bitRate,
      targetMaxKbps: MAX_KBPS_720P,
    });

    const videoBitRate1080p = this.generateVideoBitrate({
      originalBps: video.bitRate,
      targetMaxKbps: MAX_KBPS_1080P,
    });

    const audioBitRate64 = this.generateAudioBitrate(
      64,
      audio?.bitRate ?? null,
    );

    const audioBitRate96 = this.generateAudioBitrate(
      96,
      audio?.bitRate ?? null,
    );

    const audioBitRate128 = this.generateAudioBitrate(
      128,
      audio?.bitRate ?? null,
    );

    const audioBitRate192 = this.generateAudioBitrate(
      192,
      audio?.bitRate ?? null,
    );

    await this.prepareOutputDirectories(outputDirectory, RESOLUTIONS);

    return {
      toMax144: () =>
        this.runFfmpegArgs([
          '-y',
          '-i',
          preSignUrl,
          '-filter_complex',
          '[0:v]scale=w=256:h=144,unsharp=5:5:0.8:5:5:0.0[out144]',
          ...this.mapStream('out144', videoBitRate144p, outputDirectory, 144),
          ...this.mapAudio(audioBitRate64, outputDirectory),
        ]),

      toMax360: () =>
        this.runFfmpegArgs([
          '-y',
          '-i',
          preSignUrl,
          '-filter_complex',
          '[0:v]split=2[v144][v360];[v144]scale=w=256:h=144,unsharp=5:5:0.8:5:5:0.0[out144];[v360]scale=w=640:h=360,unsharp=5:5:0.8:5:5:0.0[out360]',
          ...this.mapStream('out144', videoBitRate144p, outputDirectory, 144),
          ...this.mapStream('out360', videoBitRate360p, outputDirectory, 360),
          ...this.mapAudio(audioBitRate96, outputDirectory),
        ]),

      toMax480: () =>
        this.runFfmpegArgs([
          '-y',
          '-i',
          preSignUrl,
          '-filter_complex',
          '[0:v]split=3[v144][v360][v480];[v144]scale=w=256:h=144,unsharp=5:5:0.8:5:5:0.0[out144];[v360]scale=w=640:h=360,unsharp=5:5:0.8:5:5:0.0[out360];[v480]scale=w=854:h=480,unsharp=5:5:0.8:5:5:0.0[out480]',
          ...this.mapStream('out144', videoBitRate144p, outputDirectory, 144),
          ...this.mapStream('out360', videoBitRate360p, outputDirectory, 360),
          ...this.mapStream('out480', videoBitRate480p, outputDirectory, 480),
          ...this.mapAudio(audioBitRate128, outputDirectory),
        ]),

      toMax720: () =>
        this.runFfmpegArgs([
          '-y',
          '-i',
          preSignUrl,
          '-filter_complex',
          '[0:v]split=4[v144][v360][v480][v720];[v144]scale=w=256:h=144,unsharp=5:5:0.8:5:5:0.0[out144];[v360]scale=w=640:h=360,unsharp=5:5:0.8:5:5:0.0[out360];[v480]scale=w=854:h=480,unsharp=5:5:0.8:5:5:0.0[out480];[v720]scale=w=1280:h=720,unsharp=5:5:0.8:5:5:0.0[out720]',
          ...this.mapStream('out144', videoBitRate144p, outputDirectory, 144),
          ...this.mapStream('out360', videoBitRate360p, outputDirectory, 360),
          ...this.mapStream('out480', videoBitRate480p, outputDirectory, 480),
          ...this.mapStream('out720', VideoBitRate720p, outputDirectory, 720),
          ...this.mapAudio(audioBitRate128, outputDirectory),
        ]),

      toMax1080: () =>
        this.runFfmpegArgs([
          '-y',
          '-i',
          preSignUrl,
          '-filter_complex',
          '[0:v]split=5[v144][v360][v480][v720][v1080];[v144]scale=w=256:h=144,unsharp=5:5:0.8:5:5:0.0[out144];[v360]scale=w=640:h=360,unsharp=5:5:0.8:5:5:0.0[out360];[v480]scale=w=854:h=480,unsharp=5:5:0.8:5:5:0.0[out480];[v720]scale=w=1280:h=720,unsharp=5:5:0.8:5:5:0.0[out720];[v1080]scale=w=1920:h=1080,unsharp=5:5:0.8:5:5:0.0[out1080]',
          ...this.mapStream('out144', videoBitRate144p, outputDirectory, 144),
          ...this.mapStream('out360', videoBitRate360p, outputDirectory, 360),
          ...this.mapStream('out480', videoBitRate480p, outputDirectory, 480),
          ...this.mapStream('out720', VideoBitRate720p, outputDirectory, 720),
          ...this.mapStream(
            'out1080',
            videoBitRate1080p,
            outputDirectory,
            1080,
          ),
          ...this.mapAudio(audioBitRate192, outputDirectory),
        ]),
    };
  }
}
