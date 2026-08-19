/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call */

import { Injectable } from '@nestjs/common';
import { spawn } from 'node:child_process';
import { VideoMetadata } from './ffprobe.interface';
import { PinoLogger } from 'nestjs-pino';

// Runs ffprobe against the video at the given presigned URL.
// Equivalent CLI command:
//
// ffprobe -v error \
//   -show_entries 'stream=codec_type,codec_name,profile,level,width,height,pix_fmt,r_frame_rate,avg_frame_rate,bit_rate,sample_aspect_ratio,display_aspect_ratio,sample_rate,channels' \
//   -show_entries 'format=format_name,size,duration,bit_rate' \
//   -of json \
//   <presignedUrl>

@Injectable()
export class FfprobeService {
  constructor(private readonly pino: PinoLogger) {}

  getVideoMetadata(inputPreSignUrl: string): Promise<VideoMetadata> {
    return new Promise((resolve, reject) => {
      const ffprobe = spawn('ffprobe', [
        '-v',
        'error',
        '-show_entries',
        'stream=codec_type,codec_name,profile,level,width,height,pix_fmt,r_frame_rate,avg_frame_rate,bit_rate,sample_aspect_ratio,display_aspect_ratio,sample_rate,channels',
        '-show_entries',
        'format=format_name,size,duration,bit_rate',
        '-of',
        'json',
        inputPreSignUrl,
      ]);

      let output: string = '';

      ffprobe.stdout.on('data', (data: Buffer) => {
        output += data.toString();
      });

      ffprobe.on('error', (error) => {
        reject(error);
        this.pino.error('ffprobe error', error);
      });

      ffprobe.on('close', (code) => {
        if (code !== 0) {
          this.pino.error('ffprobe error', code);
          reject(new Error(`ffprobe exited with code ${code}`));
          return;
        }

        try {
          const result = JSON.parse(output);

          const video = result.streams?.find(
            (stream: any) => stream.codec_type === 'video',
          );

          const audio = result.streams?.find(
            (stream: any) => stream.codec_type === 'audio',
          );

          if (!video) {
            reject(new Error('No video stream found'));
            return;
          }

          resolve({
            video: {
              codecName: video.codec_name,
              profile: video.profile ?? null,
              codecType: video.codec_type,
              width: Number(video.width),
              height: Number(video.height),
              sampleAspectRatio: video.sample_aspect_ratio ?? null,
              displayAspectRatio: video.display_aspect_ratio ?? null,
              pixelFormat: video.pix_fmt ?? null,
              level: video.level ?? null,
              frameRate: video.r_frame_rate,
              averageFrameRate: video.avg_frame_rate,
              bitRate: video.bit_rate ? Number(video.bit_rate) : null,
            },

            audio: audio
              ? {
                  codecName: audio.codec_name,
                  profile: audio.profile ?? null,
                  codecType: audio.codec_type,
                  sampleRate: audio.sample_rate
                    ? Number(audio.sample_rate)
                    : null,
                  channels: audio.channels ? Number(audio.channels) : null,
                  bitRate: audio.bit_rate ? Number(audio.bit_rate) : null,
                }
              : undefined,

            format: {
              formatName: result.format.format_name,
              duration: Number(result.format.duration),
              size: Number(result.format.size),
              bitRate: result.format.bit_rate
                ? Number(result.format.bit_rate)
                : null,
            },
          });
        } catch (error) {
          reject(
            new Error(
              `Failed to parse ffprobe output: ${
                error instanceof Error ? error.message : String(error)
              }`,
            ),
          );
        }
      });
    });
  }
}
