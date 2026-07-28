import { Prisma } from '@prisma/client';

export type ChannelResult = Prisma.ChannelGetPayload<{
  select: {
    id: true;
    userId: true;
    title: true;
    description: true;
    avatar: true;
    banner: true;
    isVerified: true;
    createdAt: true;
    updatedAt: true;
    deletedAt: true;
    videoCount: true;
    subscriberCount: true;
  };
}>;
