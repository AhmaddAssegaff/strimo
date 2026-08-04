import { Video } from '@prisma/client';
import { Pagination } from '~app/core/interface/pagination.interface';

export interface VideosResult extends Pagination {
  videos: Video[];
}

export interface VideoResult {
  video: Video;
}
