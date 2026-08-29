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

export interface CreateUserOauthResult {
  id: string;
  email: string;
  channel: {
    id: string;
  };
}

export type UpdateUserProfileResult = Prisma.UserGetPayload<{
  select: {
    id: true;
    email: true;
    username: true;
    isEmailVerified: true;
    profilePicture: true;
    createdAt: true;
    deletedAt: true;
    updatedAt: true;
  };
}>;
