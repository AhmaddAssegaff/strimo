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

export type FindUserCredensialByIdResult = Prisma.UserGetPayload<{
  select: {
    id: true;
    email: true;
    isEmailVerified: true;
  };
}>;

export type CreateUserOauthResult = Prisma.UserGetPayload<{
  select: {
    id: true;
    email: true;
  };
}>;

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
