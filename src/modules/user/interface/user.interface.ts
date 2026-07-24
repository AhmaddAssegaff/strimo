import { Prisma } from '@prisma/client';

export type UserProfileResult = Prisma.UserGetPayload<{
  select: {
    id: true;
    email: true;
    username: true;
    profilePicture: true;
    isEmailVerified: true;
    createdAt: true;
  };
}>;
