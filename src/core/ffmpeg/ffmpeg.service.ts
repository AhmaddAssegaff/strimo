/* eslint-disable @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call */

import { spawn } from 'node:child_process';
import * as path from 'node:path';
import { mkdir } from 'node:fs/promises';

// Runs FFmpeg to transcode a video from a presigned URL into one or more
// resolution variants.
//
// The service generates different video resolutions based on the requested
// maximum quality (144p, 360p, 480p, 720p, or 1080p).
//
// Each variant is encoded using H.264 (libopenh264) with a bitrate capped
// by the original video's bitrate, so transcoding does not increase the
// target bitrate beyond the source video.
//
// Audio is encoded separately using AAC.
//
// Example:
//
// ffmpeg -i <presignedUrl> \
//   -filter_complex "[0:v]fps=24,scale=w=256:h=144[out144]" \
//   -map "[out144]" -c:v libopenh264 -b:v 250k ... \
//   -map 0:a? -c:a aac -b:a 64k ...
//
// Output structure:
//
// transcoded/
// ├── audio/
// │   └── audio.mp4
// └── video/
//     ├── 144/
//     │   └── video.mp4
//     ├── 360/
//     │   └── video.mp4
//     ├── 480/
//     │   └── video.mp4
//     ├── 720/
//     │   └── video.mp4
//     └── 1080/
//         └── video.mp4

export class FfmpegService {
  private runFfmpegArgs(args: string[]): Promise<void> {
    return new Promise((resolve, reject) => {
      const ffmpeg = spawn('ffmpeg', args);

      let stderrData = '';
      ffmpeg.stderr.on('data', (data) => {
        stderrData += data.toString();
      });

      ffmpeg.on('error', (error) => {
        reject(error);
      });

      ffmpeg.on('close', (code) => {
        if (code === 0) {
          resolve();
          return;
        }

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

  private generateBitrate(params: {
    targetMaxKbps: number;
    originalBps: number | null;
  }): string {
    if (!params.originalBps) {
      return `${params.targetMaxKbps}k`;
    }

    const originalKbps = Math.round(params.originalBps / 1000);

    const finalKbps = Math.min(params.targetMaxKbps, originalKbps);

    return `${finalKbps}k`;
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
      '-g',
      '48',
      '-keyint_min',
      '48',
      '-sc_threshold',
      '0',
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
    originalVideoBitrate: number | null;
  }) {
    const { preSignUrl, outputDirectory, originalVideoBitrate } = params;

    const MAX_KBPS_144P = 250;
    const MAX_KBPS_360P = 800;
    const MAX_KBPS_480P = 1400;
    const MAX_KBPS_720P = 2500;
    const MAX_KBPS_1080P = 4000;

    const bitRate144p = this.generateBitrate({
      originalBps: originalVideoBitrate,
      targetMaxKbps: MAX_KBPS_144P,
    });

    const bitRate360p = this.generateBitrate({
      originalBps: originalVideoBitrate,
      targetMaxKbps: MAX_KBPS_360P,
    });

    const bitRate480p = this.generateBitrate({
      originalBps: originalVideoBitrate,
      targetMaxKbps: MAX_KBPS_480P,
    });

    const bitRate720p = this.generateBitrate({
      originalBps: originalVideoBitrate,
      targetMaxKbps: MAX_KBPS_720P,
    });

    const bitRate1080p = this.generateBitrate({
      originalBps: originalVideoBitrate,
      targetMaxKbps: MAX_KBPS_1080P,
    });

    /*
     * Prepare all possible output directories.
     *
     * The actual FFmpeg command determines which resolutions
     * are populated.
     */
    await this.prepareOutputDirectories(
      outputDirectory,
      [144, 360, 480, 720, 1080],
    );

    return {
      toMax144: () =>
        this.runFfmpegArgs([
          '-i',
          preSignUrl,

          '-filter_complex',
          '[0:v]fps=24,scale=w=256:h=144[out144]',

          ...this.mapStream('out144', bitRate144p, outputDirectory, 144),

          ...this.mapAudio('64k', outputDirectory),
        ]),

      toMax360: () =>
        this.runFfmpegArgs([
          '-i',
          preSignUrl,
          '-filter_complex',
          '[0:v]fps=24,split=2[v144][v360];[v144]scale=w=256:h=144[out144];[v360]scale=w=640:h=360[out360]',
          ...this.mapStream('out144', bitRate144p, outputDirectory, 144),
          ...this.mapStream('out360', bitRate360p, outputDirectory, 360),
          ...this.mapAudio('96k', outputDirectory),
        ]),

      toMax480: () =>
        this.runFfmpegArgs([
          '-i',
          preSignUrl,
          '-filter_complex',
          '[0:v]fps=24,split=3[v144][v360][v480];[v144]scale=w=256:h=144[out144];[v360]scale=w=640:h=360[out360];[v480]scale=w=854:h=480[out480]',
          ...this.mapStream('out144', bitRate144p, outputDirectory, 144),
          ...this.mapStream('out360', bitRate360p, outputDirectory, 360),
          ...this.mapStream('out480', bitRate480p, outputDirectory, 480),
          ...this.mapAudio('128k', outputDirectory),
        ]),

      toMax720: () =>
        this.runFfmpegArgs([
          '-i',
          preSignUrl,
          '-filter_complex',
          '[0:v]fps=24,split=4[v144][v360][v480][v720];[v144]scale=w=256:h=144[out144];[v360]scale=w=640:h=360[out360];[v480]scale=w=854:h=480[out480];[v720]scale=w=1280:h=720[out720]',
          ...this.mapStream('out144', bitRate144p, outputDirectory, 144),
          ...this.mapStream('out360', bitRate360p, outputDirectory, 360),
          ...this.mapStream('out480', bitRate480p, outputDirectory, 480),
          ...this.mapStream('out720', bitRate720p, outputDirectory, 720),
          ...this.mapAudio('128k', outputDirectory),
        ]),

      toMax1080: () =>
        this.runFfmpegArgs([
          '-i',
          preSignUrl,
          '-filter_complex',
          '[0:v]fps=24,split=5[v144][v360][v480][v720][v1080];[v144]scale=w=256:h=144[out144];[v360]scale=w=640:h=360[out360];[v480]scale=w=854:h=480[out480];[v720]scale=w=1280:h=720[out720];[v1080]scale=w=1920:h=1080[out1080]',
          ...this.mapStream('out144', bitRate144p, outputDirectory, 144),
          ...this.mapStream('out360', bitRate360p, outputDirectory, 360),
          ...this.mapStream('out480', bitRate480p, outputDirectory, 480),
          ...this.mapStream('out720', bitRate720p, outputDirectory, 720),
          ...this.mapStream('out1080', bitRate1080p, outputDirectory, 1080),
          ...this.mapAudio('192k', outputDirectory),
        ]),
    };
  }
}
