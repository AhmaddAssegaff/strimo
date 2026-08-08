import { Prisma, Video } from '@prisma/client';
import { Pagination } from '~app/core/interface/pagination.interface';

export type VideoResult = Video;

export type VideosResult = {
  videos: Video[];
} & Pagination;

export type VideoAndUploadResult = Prisma.VideoGetPayload<{
  include: {
    uploads: {
      select: {
        completedAt: true;
      };
    };
  };
}>;
