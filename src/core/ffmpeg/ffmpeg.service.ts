/* eslint-disable @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call */
import * as path from 'node:path';
import { spawn } from 'node:child_process';
import { mkdir } from 'node:fs/promises';

type Resolution = 144 | 360 | 480 | 720 | 1080;
const RESOLUTIONS: Resolution[] = [144, 360, 480, 720, 1080];

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

    await mkdir(path.join(outputDirectory, 'thumbnail'), {
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

  private getDynamicScaleFilter(target: number): string {
    return `scale='if(gt(iw,ih),${target},-2)':'if(gt(iw,ih),-2,${target})'`;
  }

  private mapStreamVideo(
    label: string,
    outputDirectory: string,
    resolution: number,
  ): string[] {
    return [
      '-map',
      `[${label}]`,
      '-c:v',
      'libx264',
      '-crf',
      '23', // Using CRF 23 Standart FFmpeg
      '-preset',
      'medium',
      '-profile:v',
      'high',
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

  private mapAudio(outputDirectory: string): string[] {
    return [
      '-map',
      '0:a?',
      '-c:a',
      'aac', // FFmpeg will use default bitrate (128k)
      path.join(outputDirectory, 'audio', 'audio.mp4'),
    ];
  }

  private generateThumbnail(params: {
    input: string;
    outputPath: string;
    timestamp?: number;
  }): Promise<void> {
    const { input, outputPath, timestamp = 1 } = params;

    return this.runFfmpegArgs([
      '-y',
      '-ss',
      String(timestamp),
      '-i',
      input,
      '-frames:v',
      '1',
      '-vf',
      "scale='if(gt(iw,ih),1280,-2)':'if(gt(iw,ih),-2,1280)'",
      '-c:v',
      'libwebp',
      '-quality',
      '80',
      outputPath,
    ]);
  }

  async transcodeVideo(params: { preSignUrl: string; videoOutputDir: string }) {
    const { preSignUrl, videoOutputDir } = params;

    await this.prepareOutputDirectories(videoOutputDir, RESOLUTIONS);

    const s144 = this.getDynamicScaleFilter(256);
    const s360 = this.getDynamicScaleFilter(640);
    const s480 = this.getDynamicScaleFilter(854);
    const s720 = this.getDynamicScaleFilter(1280);
    const s1080 = this.getDynamicScaleFilter(1920);

    return {
      generateThumbnail: (): Promise<void> =>
        this.generateThumbnail({
          input: preSignUrl,
          outputPath: path.join(videoOutputDir, 'thumbnail', 'thumbnail.webp'),
        }),

      extractAudio: (): Promise<void> =>
        this.runFfmpegArgs([...this.mapAudio(videoOutputDir)]),

      video: {
        toMax144: (): Promise<void> =>
          this.runFfmpegArgs([
            '-y',
            '-i',
            preSignUrl,
            '-filter_complex',
            `[0:v]split=2[v144][v360];[v144]${s144}[out144];`,
            ...this.mapStreamVideo('out144', videoOutputDir, 144),
          ]),

        toMax360: (): Promise<void> =>
          this.runFfmpegArgs([
            '-y',
            '-i',
            preSignUrl,
            '-filter_complex',
            `[0:v]split=2[v144][v360];[v144]${s144}[out144];[v360]${s360}[out360]`,
            ...this.mapStreamVideo('out144', videoOutputDir, 144),
            ...this.mapStreamVideo('out360', videoOutputDir, 360),
          ]),

        toMax480: (): Promise<void> =>
          this.runFfmpegArgs([
            '-y',
            '-i',
            preSignUrl,
            '-filter_complex',
            `[0:v]split=3[v144][v360][v480];[v144]${s144}[out144];[v360]${s360}[out360];[v480]${s480}[out480]`,
            ...this.mapStreamVideo('out144', videoOutputDir, 144),
            ...this.mapStreamVideo('out360', videoOutputDir, 360),
            ...this.mapStreamVideo('out480', videoOutputDir, 480),
          ]),

        toMax720: (): Promise<void> =>
          this.runFfmpegArgs([
            '-y',
            '-i',
            preSignUrl,
            '-filter_complex',
            `[0:v]split=4[v144][v360][v480][v720];[v144]${s144}[out144];[v360]${s360}[out360];[v480]${s480}[out480];[v720]${s720}[out720]`,
            ...this.mapStreamVideo('out144', videoOutputDir, 144),
            ...this.mapStreamVideo('out360', videoOutputDir, 360),
            ...this.mapStreamVideo('out480', videoOutputDir, 480),
            ...this.mapStreamVideo('out720', videoOutputDir, 720),
          ]),

        toMax1080: (): Promise<void> =>
          this.runFfmpegArgs([
            '-y',
            '-i',
            preSignUrl,
            '-filter_complex',
            `[0:v]split=5[v144][v360][v480][v720][v1080];[v144]${s144}[out144];[v360]${s360}[out360];[v480]${s480}[out480];[v720]${s720}[out720];[v1080]${s1080}[out1080]`,
            ...this.mapStreamVideo('out144', videoOutputDir, 144),
            ...this.mapStreamVideo('out360', videoOutputDir, 360),
            ...this.mapStreamVideo('out480', videoOutputDir, 480),
            ...this.mapStreamVideo('out720', videoOutputDir, 720),
            ...this.mapStreamVideo('out1080', videoOutputDir, 1080),
          ]),
      },
    };
  }
}
