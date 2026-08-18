interface VideoStreamMetadata {
  codecName: string;
  profile: string | null;
  codecType: 'video';
  width: number;
  height: number;
  sampleAspectRatio: string | null;
  displayAspectRatio: string | null;
  pixelFormat: string | null;
  level: number | null;
  frameRate: string;
  averageFrameRate: string;
  bitRate: number | null;
}

interface AudioStreamMetadata {
  codecName: string;
  profile: string | null;
  codecType: 'audio';
  sampleRate: number | null;
  channels: number | null;
  bitRate: number | null;
}

interface FormatMetadata {
  formatName: string;
  duration: number;
  size: number;
  bitRate: number | null;
}

export interface VideoMetadata {
  video: VideoStreamMetadata;
  audio?: AudioStreamMetadata;
  format: FormatMetadata;
}
