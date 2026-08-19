import { Injectable } from '@nestjs/common';
import { spawn } from 'node:child_process';
import * as path from 'node:path';

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

interface PackagerOptions {
  videoInputDir: string;
  audioInputDir: string;

  videoOutputDir: string;
  audioOutputDir: string;

  hlsOutputDir: string;
  mpegDashOutputDir: string;
}

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

  private videoCommand(
    videoInputDir: string,
    videoOutputDir: string,
    resolution: number,
  ): string {
    const input = path.join(
      videoInputDir,
      `${resolution}p`,
      `v_${resolution}.mp4`,
    );
    const output = path.join(videoOutputDir, `${resolution}p`);

    return `in=${input},stream=video,output=${output}/`;
  }

  private audioCommand(audioInputDir: string, audioOutputDir: string): string {
    const input = path.join(audioInputDir, 'audio.mp4');

    return `in=${input},stream=audio,output=${audioOutputDir}/`;
  }

  private mpegDashCommand(mpegDashOutputDir: string): string[] {
    return ['--mpd_output', path.join(mpegDashOutputDir, 'manifest.mpd')];
  }

  private hlsCommand(hlsOutputDir: string): string[] {
    return [
      '--hls_master_playlist_output',
      path.join(hlsOutputDir, 'master.m3u8'),
    ];
  }

  pack({
    videoInputDir,
    audioInputDir,
    videoOutputDir,
    audioOutputDir,
    hlsOutputDir,
    mpegDashOutputDir,
  }: PackagerOptions) {
    return {
      toMax144: (): Promise<void> => {
        const args = [
          this.videoCommand(videoInputDir, videoOutputDir, 144),
          this.audioCommand(audioInputDir, audioOutputDir),
          ...this.mpegDashCommand(mpegDashOutputDir),
          ...this.hlsCommand(hlsOutputDir),
        ];

        return this.runPackagerArgs(args);
      },

      toMax360: (): Promise<void> => {
        const args = [
          this.videoCommand(videoInputDir, videoOutputDir, 144),
          this.videoCommand(videoInputDir, videoOutputDir, 360),
          this.audioCommand(audioInputDir, audioOutputDir),
          ...this.mpegDashCommand(mpegDashOutputDir),
          ...this.hlsCommand(hlsOutputDir),
        ];

        return this.runPackagerArgs(args);
      },

      toMax480: (): Promise<void> => {
        const args = [
          this.videoCommand(videoInputDir, videoOutputDir, 144),
          this.videoCommand(videoInputDir, videoOutputDir, 360),
          this.videoCommand(videoInputDir, videoOutputDir, 480),
          this.audioCommand(audioInputDir, audioOutputDir),
          ...this.mpegDashCommand(mpegDashOutputDir),
          ...this.hlsCommand(hlsOutputDir),
        ];

        return this.runPackagerArgs(args);
      },

      toMax720: (): Promise<void> => {
        const args = [
          this.videoCommand(videoInputDir, videoOutputDir, 144),
          this.videoCommand(videoInputDir, videoOutputDir, 360),
          this.videoCommand(videoInputDir, videoOutputDir, 480),
          this.videoCommand(videoInputDir, videoOutputDir, 720),
          this.audioCommand(audioInputDir, audioOutputDir),
          ...this.mpegDashCommand(mpegDashOutputDir),
          ...this.hlsCommand(hlsOutputDir),
        ];

        return this.runPackagerArgs(args);
      },

      toMax1080: (): Promise<void> => {
        const args = [
          this.videoCommand(videoInputDir, videoOutputDir, 144),
          this.videoCommand(videoInputDir, videoOutputDir, 360),
          this.videoCommand(videoInputDir, videoOutputDir, 480),
          this.videoCommand(videoInputDir, videoOutputDir, 720),
          this.videoCommand(videoInputDir, videoOutputDir, 1080),
          this.audioCommand(audioInputDir, audioOutputDir),
          ...this.mpegDashCommand(mpegDashOutputDir),
          ...this.hlsCommand(hlsOutputDir),
        ];

        return this.runPackagerArgs(args);
      },
    };
  }
}
