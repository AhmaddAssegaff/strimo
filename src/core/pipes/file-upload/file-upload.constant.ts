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
  minWidth?: number;
  minHeight?: number;
}

export const UPLOAD_RULES = {
  profilePicture: {
    maxSize: MB(2),
    allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
    fileTypeRegex: /^image\/(jpeg|png|webp)$/,

    fileIsRequired: true,
    maxFileSizeErrorMessage: 'Profile picture must not exceed 2 MB.',
    fileTypeErrorMessage: 'Profile picture must be a JPEG, PNG, or WebP image.',

    aspectRatio: ASPECT_RATIOS.SQUARE,
    minWidth: 200,
  },

  avatar: {
    maxSize: MB(2),
    allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
    fileTypeRegex: /^image\/(jpeg|png|webp)$/,

    fileIsRequired: true,
    maxFileSizeErrorMessage: 'Channel avatar must not exceed 2 MB.',
    fileTypeErrorMessage: 'Channel avatar must be a JPEG, PNG, or WebP image.',

    aspectRatio: ASPECT_RATIOS.SQUARE,
  },

  banner: {
    maxSize: MB(5),
    allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
    fileTypeRegex: /^image\/(jpeg|png|webp)$/,

    fileIsRequired: true,
    maxFileSizeErrorMessage: 'Channel banner must not exceed 5 MB.',
    fileTypeErrorMessage: 'Channel banner must be a JPEG, PNG, or WebP image.',

    aspectRatio: ASPECT_RATIOS.LANDSCAPE_16_9,
    minWidth: 1200,
  },

  videoThumbnail: {
    maxSize: MB(3),
    allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
    fileTypeRegex: /^image\/(jpeg|png|webp)$/,

    fileIsRequired: true,
    maxFileSizeErrorMessage: 'Video thumbnail must not exceed 3 MB.',
    fileTypeErrorMessage: 'Video thumbnail must be a JPEG, PNG, or WebP image.',

    aspectRatio: ASPECT_RATIOS.LANDSCAPE_16_9,
  },

  video: {
    maxSize: MB(100),
    allowedMimeTypes: ['video/mp4', 'video/webm', 'video/x-matroska'],
    fileTypeRegex: /^video\/(mp4|webm|x-matroska)$/,

    fileIsRequired: true,
    maxFileSizeErrorMessage: 'Video must not exceed 100 MB.',
    fileTypeErrorMessage: 'Video must be an MP4, WebM, or MKV file.',
  },
} satisfies Record<string, FileRule>;

export type UploadRuleKey = keyof typeof UPLOAD_RULES;
