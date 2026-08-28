import { Prisma } from '@prisma/client';

export type VideoResult = Prisma.VideoGetPayload<{
  select: {
    status: true;
    visibility: true;
  };
}>;
