import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { StartedTestContainer } from 'testcontainers';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { AppModule } from '~app/app.module';
import {
  startPostgresContainer,
  startRedisContainer,
  stopContainers,
} from 'test/infrastructure/containers';
import { PrismaService } from '~app/infra/prisma/prisma.service';
import { AuthService } from '../../auth.service';
import {
  AuthenticatedUser,
  UserOauthGoogle,
} from '../../interface/auth.interface';

describe('Auth INTEGRATION TEST', () => {
  let app: INestApplication;
  let pg: StartedTestContainer;
  // TODO: Make redis not fail-fast only during test env and dev
  let redis: StartedTestContainer;
  let prisma: PrismaService;
  let authService: AuthService;

  beforeAll(async () => {
    pg = await startPostgresContainer();
    redis = await startRedisContainer();

    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    await app.init();

    prisma = app.get(PrismaService);
    authService = app.get(AuthService);
  });

  afterAll(async () => {
    await app?.close();
    await stopContainers(pg);
    await stopContainers(redis);
  });

  describe('googleOauth', () => {
    const oauthUser: UserOauthGoogle = {
      email: 'email@gmail.com',
      googleId: 'googleId',
      name: 'name',
      picture: 'pictureUrl',
    };

    it('should creates user, google account, and channel and returns tokens', async () => {
      const res = await authService.googleOauth(oauthUser);

      expect(res.tokens.accessToken).toEqual(expect.any(String));
      expect(res.tokens.refreshToken).toEqual(expect.any(String));

      const createdUser = await prisma.user.findUnique({
        where: { email: oauthUser.email },
        include: {
          accounts: true,
          channel: true,
        },
      });

      expect(createdUser).not.toBeNull();
      expect(createdUser?.username).toBe(oauthUser.name);
      expect(createdUser?.channel).not.toBeNull();
    });
  });

  describe('refreshToken', () => {
    const user: AuthenticatedUser = {
      channelId: 'channelId',
      email: 'email@gmail.com',
      sub: 'userId',
    };

    it('should return new accessToken', () => {
      const res = authService.refreshToken(user);

      expect(res).toHaveProperty('token');
      expect(res.token).toHaveProperty('accessToken');
    });
  });
});
