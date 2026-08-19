import { Injectable } from '@nestjs/common';
import { spawn } from 'node:child_process';
import * as path from 'node:path';
import { mkdir } from 'node:fs/promises';

// method packingVideo equivalent with CLI command:
//
// packager \
//   in=.temp/[videoId]/transcoded/video/144p/v_144.mp4,stream=video,output=.temp/[videoId]/output/video/144p/ \
//   in=.temp/[videoId]/transcoded/video/360p/v_360.mp4,stream=video,output=.temp/[videoId]/output/video/360p/ \
//   in=.temp/[videoId]/transcoded/video/480p/v_480.mp4,stream=video,output=.temp/[videoId]/output/video/480p/ \
//   in=.temp/[videoId]/transcoded/video/1080p/v_1080.mp4,stream=video,output=.temp/[videoId]/output/video/1080p/ \
//   in=.temp/[videoId]/transcoded/audio/audio.mp4,stream=audio,output=.temp/[videoId]/output/audio/ \
//   --mpd_output .temp/[videoId]/output/dash/manifest.mpd \
//   --hls_master_playlist_output .temp/[videoId]/output/hls/master.m3u8

type Resolution = 144 | 360 | 480 | 720 | 1080;
const RESOLUTIONS: Resolution[] = [144, 360, 480, 720, 1080];

@Injectable()
export class ShakaPackagerService {
  private runPackagerArgs(args: string[]): Promise<void> {
    return new Promise((resolve, reject) => {
      const packager = spawn('packager', args);

      let stderrData = '';

      packager.stderr.on('data', (data: Buffer) => {
        stderrData += data.toString();
      });

      packager.on('error', (error) => {
        reject(error);
      });

      packager.on('close', (code) => {
        if (code === 0) {
          resolve();
          return;
        }

        reject(
          new Error(`Shaka Packager exited with code ${code}: ${stderrData}`),
        );
      });
    });
  }

  private async prepareOutputDirectories(
    outputDirectory: string,
    resolutions: Resolution[],
  ): Promise<void> {
    await Promise.all([
      mkdir(path.join(outputDirectory, 'audio'), {
        recursive: true,
      }),

      mkdir(path.join(outputDirectory, 'hls'), {
        recursive: true,
      }),

      mkdir(path.join(outputDirectory, 'dash'), {
        recursive: true,
      }),

      ...resolutions.map((resolution) =>
        mkdir(path.join(outputDirectory, 'video', String(resolution)), {
          recursive: true,
        }),
      ),
    ]);
  }

  private videoCommand(
    inputDirectory: string,
    outputDirectory: string,
    resolution: Resolution,
  ): string {
    const input = path.join(
      inputDirectory,
      'video',
      String(resolution),
      'video.mp4',
    );

    const output = path.join(
      outputDirectory,
      'video',
      String(resolution),
      'video.mp4',
    );

    return `in=${input},stream=video,output=${output}`;
  }

  private audioCommand(
    inputDirectory: string,
    outputDirectory: string,
  ): string {
    const input = path.join(inputDirectory, 'audio', 'audio.mp4');
    const output = path.join(outputDirectory, 'audio', 'audio.mp4');

    return `in=${input},stream=audio,output=${output}`;
  }

  private mpegDashCommand(outputDirectory: string): string[] {
    return ['--mpd_output', path.join(outputDirectory, 'dash', 'manifest.mpd')];
  }

  private hlsCommand(outputDirectory: string): string[] {
    return [
      '--hls_master_playlist_output',
      path.join(outputDirectory, 'hls', 'master.m3u8'),
    ];
  }

  private buildArgs(
    inputDirectory: string,
    outputDirectory: string,
    resolutions: Resolution[],
  ): string[] {
    return [
      ...resolutions.map((resolution) =>
        this.videoCommand(inputDirectory, outputDirectory, resolution),
      ),

      this.audioCommand(inputDirectory, outputDirectory),

      ...this.mpegDashCommand(outputDirectory),
      ...this.hlsCommand(outputDirectory),
    ];
  }

  async pack(params: { inputDirectory: string; outputDirectory: string }) {
    const { inputDirectory, outputDirectory } = params;

    await this.prepareOutputDirectories(outputDirectory, RESOLUTIONS);

    return {
      toMax144: () =>
        this.runPackagerArgs(
          this.buildArgs(inputDirectory, outputDirectory, [144]),
        ),

      toMax360: () =>
        this.runPackagerArgs(
          this.buildArgs(inputDirectory, outputDirectory, [144, 360]),
        ),

      toMax480: () =>
        this.runPackagerArgs(
          this.buildArgs(inputDirectory, outputDirectory, [144, 360, 480]),
        ),

      toMax720: () =>
        this.runPackagerArgs(
          this.buildArgs(inputDirectory, outputDirectory, [144, 360, 480, 720]),
        ),

      toMax1080: () =>
        this.runPackagerArgs(
          this.buildArgs(
            inputDirectory,
            outputDirectory,
            [144, 360, 480, 720, 1080],
          ),
        ),
    };
  }
}
