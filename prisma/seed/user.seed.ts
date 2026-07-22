import { PrismaClient } from '@prisma/client';

export async function userSeed(prisma: PrismaClient) {
  await prisma.user.upsert({
    where: {
      email: 'email@test.com',
    },
    update: {},
    create: {
      email: 'email@test.com',
      username: 'Test E2E User',
      profilePicture: null,
      isEmailVerified: true,
    },
  });
}
