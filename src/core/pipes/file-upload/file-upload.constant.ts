const MB = (n: number) => n * 1024 * 1024;

export const ASPECT_RATIOS = {
  SQUARE: {
    width: 1,
    height: 1,
  },
  LANDSCAPE_16_9: {
    width: 16,
    height: 9,
  },
} as const;

export type AspectRatio = (typeof ASPECT_RATIOS)[keyof typeof ASPECT_RATIOS];

export interface FileRule {
  maxSize: number;
  allowedMimeTypes: readonly string[];
  fileTypeRegex: RegExp;

  fileIsRequired?: boolean;
  maxFileSizeErrorMessage?: string;
  fileTypeErrorMessage?: string;

  aspectRatio?: AspectRatio;

  validateAspectRatio?: boolean;

  minWidth: number;
  minHeight: number;

  maxWidth?: number;
  maxHeight?: number;
}

export const FILE_RULES = {
  profilePicture: {
    maxSize: MB(3),
    allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
    fileTypeRegex: /^image\/(jpeg|png|webp)$/,

    fileIsRequired: true,
    maxFileSizeErrorMessage: 'Profile picture must not exceed 2 MB.',
    fileTypeErrorMessage: 'Profile picture must be a JPEG, PNG, or WebP image.',

    aspectRatio: ASPECT_RATIOS.SQUARE,
    minWidth: 512,
    minHeight: 512,
  },

  avatar: {
    maxSize: MB(4),
    allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
    fileTypeRegex: /^image\/(jpeg|png|webp)$/,

    fileIsRequired: true,
    maxFileSizeErrorMessage: 'Channel avatar must not exceed 2 MB.',
    fileTypeErrorMessage: 'Channel avatar must be a JPEG, PNG, or WebP image.',

    aspectRatio: ASPECT_RATIOS.SQUARE,
    minHeight: 800,
    minWidth: 800,
  },

  banner: {
    maxSize: MB(6),
    allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
    fileTypeRegex: /^image\/(jpeg|png|webp)$/,

    fileIsRequired: true,
    maxFileSizeErrorMessage: 'Channel banner must not exceed 5 MB.',
    fileTypeErrorMessage: 'Channel banner must be a JPEG, PNG, or WebP image.',

    aspectRatio: ASPECT_RATIOS.LANDSCAPE_16_9,
    minWidth: 2560,
    minHeight: 1440,
  },

  videoThumbnail: {
    maxSize: MB(3),
    allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
    fileTypeRegex: /^image\/(jpeg|png|webp)$/,

    fileIsRequired: true,
    maxFileSizeErrorMessage: 'Video thumbnail must not exceed 3 MB.',
    fileTypeErrorMessage: 'Video thumbnail must be a JPEG, PNG, or WebP image.',

    minWidth: 720,
    minHeight: 720,
  },

  video: {
    maxSize: MB(5000),
    allowedMimeTypes: [
      'video/mp4',
      'video/webm',
      'video/x-matroska',
      'video/quicktime',
    ],
    fileTypeRegex: /^video\/(mp4|webm|x-matroska|quicktime)$/,

    fileIsRequired: true,
    maxFileSizeErrorMessage: 'Video must not exceed 5GB.',
    fileTypeErrorMessage: 'Video must be an MP4, WebM, or MKV file.',

    minWidth: 1280,
    minHeight: 720,
  },
} satisfies Record<string, FileRule>;

export type UploadRuleKey = keyof typeof FILE_RULES;
