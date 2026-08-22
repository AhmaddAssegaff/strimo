export const VIDEO_PROCESSING_JOB_NAME = 'transcode';

export interface TranscodeJob {
  preSignUrl: string;
  videoId: string;
}
