/* eslint-disable @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call */

import { spawn } from 'node:child_process';
import * as path from 'node:path';

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
// The generated files are written to the given output directory.

export class FfmpegService {
  private runFfmpegArgs(args: string[]): Promise<void> {
    return new Promise((resolve, reject) => {
      const ffmpeg = spawn('ffmpeg', args);

      let stderrData = '';
      ffmpeg.stderr.on('data', (data) => {
        stderrData += data.toString();
      });

      ffmpeg.on('error', (err) => reject(err));
      ffmpeg.on('close', (code) => {
        if (code === 0) resolve();
        else
          reject(new Error(`FFmpeg exited with code ${code}: ${stderrData}`));
      });
    });
  }

  private generateBitrate(params: {
    targetMaxKbps: number;
    originalBps: number | null;
  }): string {
    if (!params.originalBps) return `${params.targetMaxKbps}k`;
    const originalKbps = Math.round(params.originalBps / 1000);
    const finalKbps = Math.min(params.targetMaxKbps, originalKbps);
    return `${finalKbps}k`;
  }

  private mapStream(
    label: string,
    bitrate: string,
    outDir: string,
    filename: string,
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
      path.join(outDir, filename),
    ];
  }

  private mapAudio(bitrate: string, outDir: string): string[] {
    return [
      '-map',
      '0:a?',
      '-c:a',
      'aac',
      '-b:a',
      bitrate,
      path.join(outDir, 'audio.mp4'),
    ];
  }

  transcodeVideo(params: {
    preSignUrl: string;
    outputDirectory: string;
    originalVideoBitrate: number | null;
  }) {
    const { preSignUrl, outputDirectory, originalVideoBitrate } = params;

    const MaxKbps144p = 250;
    const MaxKbps360p = 800;
    const MaxKbps480p = 1400;
    const MaxKbps720p = 2500;
    const MaxKbps1080p = 4000;

    const bitRate144p = this.generateBitrate({
      originalBps: originalVideoBitrate,
      targetMaxKbps: MaxKbps144p,
    });
    const bitRate360p = this.generateBitrate({
      originalBps: originalVideoBitrate,
      targetMaxKbps: MaxKbps360p,
    });
    const bitRate480p = this.generateBitrate({
      originalBps: originalVideoBitrate,
      targetMaxKbps: MaxKbps480p,
    });
    const bitRate720p = this.generateBitrate({
      originalBps: originalVideoBitrate,
      targetMaxKbps: MaxKbps720p,
    });
    const bitRate1080p = this.generateBitrate({
      originalBps: originalVideoBitrate,
      targetMaxKbps: MaxKbps1080p,
    });

    return {
      toMax144: () =>
        this.runFfmpegArgs([
          '-i',
          preSignUrl,
          '-filter_complex',
          '[0:v]fps=24,scale=w=256:h=144[out144]',
          ...this.mapStream(
            'out144',
            bitRate144p,
            outputDirectory,
            'v_144.mp4',
          ),
          ...this.mapAudio('64k', outputDirectory),
        ]),

      toMax360: () =>
        this.runFfmpegArgs([
          '-i',
          preSignUrl,
          '-filter_complex',
          '[0:v]fps=24,split=2[v144][v360];[v144]scale=w=256:h=144[out144];[v360]scale=w=640:h=360[out360]',
          ...this.mapStream(
            'out144',
            bitRate144p,
            outputDirectory,
            'v_144.mp4',
          ),
          ...this.mapStream(
            'out360',
            bitRate360p,
            outputDirectory,
            'v_360.mp4',
          ),
          ...this.mapAudio('96k', outputDirectory),
        ]),

      toMax480: () =>
        this.runFfmpegArgs([
          '-i',
          preSignUrl,
          '-filter_complex',
          '[0:v]fps=24,split=3[v144][v360][v480];[v144]scale=w=256:h=144[out144];[v360]scale=w=640:h=360[out360];[v480]scale=w=854:h=480[out480]',
          ...this.mapStream(
            'out144',
            bitRate144p,
            outputDirectory,
            'v_144.mp4',
          ),
          ...this.mapStream(
            'out360',
            bitRate360p,
            outputDirectory,
            'v_360.mp4',
          ),
          ...this.mapStream(
            'out480',
            bitRate480p,
            outputDirectory,
            'v_480.mp4',
          ),
          ...this.mapAudio('128k', outputDirectory),
        ]),

      toMax720: () =>
        this.runFfmpegArgs([
          '-i',
          preSignUrl,
          '-filter_complex',
          '[0:v]fps=24,split=4[v144][v360][v480][v720];[v144]scale=w=256:h=144[out144];[v360]scale=w=640:h=360[out360];[v480]scale=w=854:h=480[out480];[v720]scale=w=1280:h=720[out720]',
          ...this.mapStream(
            'out144',
            bitRate144p,
            outputDirectory,
            'v_144.mp4',
          ),
          ...this.mapStream(
            'out360',
            bitRate360p,
            outputDirectory,
            'v_360.mp4',
          ),
          ...this.mapStream(
            'out480',
            bitRate480p,
            outputDirectory,
            'v_480.mp4',
          ),
          ...this.mapStream(
            'out720',
            bitRate720p,
            outputDirectory,
            'v_720.mp4',
          ),
          ...this.mapAudio('128k', outputDirectory),
        ]),

      toMax1080: () =>
        this.runFfmpegArgs([
          '-i',
          preSignUrl,
          '-filter_complex',
          '[0:v]fps=24,split=5[v144][v360][v480][v720][v1080];[v144]scale=w=256:h=144[out144];[v360]scale=w=640:h=360[out360];[v480]scale=w=854:h=480[out480];[v720]scale=w=1280:h=720[out720];[v1080]scale=w=1920:h=1080[out1080]',
          ...this.mapStream(
            'out144',
            bitRate144p,
            outputDirectory,
            'v_144.mp4',
          ),
          ...this.mapStream(
            'out360',
            bitRate360p,
            outputDirectory,
            'v_360.mp4',
          ),
          ...this.mapStream(
            'out480',
            bitRate480p,
            outputDirectory,
            'v_480.mp4',
          ),
          ...this.mapStream(
            'out720',
            bitRate720p,
            outputDirectory,
            'v_720.mp4',
          ),
          ...this.mapStream(
            'out1080',
            bitRate1080p,
            outputDirectory,
            'v_1080.mp4',
          ),
          ...this.mapAudio('192k', outputDirectory),
        ]),
    };
  }
}
