import { Prisma } from '@prisma/client';

export type NotficationResult = Prisma.NotificationGetPayload<{
  select: {
    id: true;
    userId: true;
    message: true;
    title: true;
    createdAt: true;
    deletedAt: true;
  };
}>;
