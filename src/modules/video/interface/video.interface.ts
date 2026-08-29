import { Prisma, Video } from '@prisma/client';

export type VideoResult = Video;

export type VideosResult = Video[];

export type VideoAndUploadResult = Prisma.VideoGetPayload<{
  include: {
    uploads: {
      select: {
        completedAt: true;
      };
    };
  };
}>;
