import { GenericContainer, StartedTestContainer } from 'testcontainers';
import { execSync } from 'node:child_process';
import dotenv from 'dotenv';

const ENV_FILE = '.env.test.local';
dotenv.config({ path: ENV_FILE });

export interface InfraContainers {
  postgres?: StartedTestContainer;
  redis?: StartedTestContainer;
  rustfs?: StartedTestContainer;
}

export function runMigrations() {
  execSync('pnpm exec prisma migrate deploy', {
    stdio: 'inherit',
    env: process.env,
  });
}

export async function startPostgresContainer(): Promise<StartedTestContainer> {
  const container = await new GenericContainer('postgres:18-alpine')
    .withEnvironment({
      POSTGRES_USER: process.env.POSTGRES_USER!,
      POSTGRES_PASSWORD: process.env.POSTGRES_PASSWORD!,
      POSTGRES_DB: process.env.POSTGRES_DB!,
    })
    .withExposedPorts(5432)
    .start();

  const host = container.getHost();
  const port = container.getMappedPort(5432);

  process.env.DATABASE_HOST = host;
  process.env.DATABASE_PORT = String(port);
  process.env.DATABASE_URL = `postgresql://${process.env.POSTGRES_USER}:${process.env.POSTGRES_PASSWORD}@${host}:${port}/${process.env.POSTGRES_DB}`;
  runMigrations();

  return container;
}

export async function startRedisContainer(): Promise<StartedTestContainer> {
  const container = await new GenericContainer('redis:7-alpine')
    .withExposedPorts(6379)
    .start();

  process.env.REDIS_HOST = container.getHost();
  process.env.REDIS_PORT = String(container.getMappedPort(6379));

  return container;
}

export async function startRustfsContainer(): Promise<StartedTestContainer> {
  const container = await new GenericContainer('rustfs/rustfs:1.0.7')
    .withEnvironment({
      RUSTFS_ACCESS_KEY: process.env.S3_ACCESS_KEY!,
      RUSTFS_SECRET_KEY: process.env.S3_SECRET_KEY!,
      RUSTFS_VOLUMES: '/data',
      RUSTFS_ADDRESS: ':9000',
      RUSTFS_CONSOLE_ENABLE: 'false',
    })
    .withExposedPorts(9000)
    .start();

  const host = container.getHost();
  const port = container.getMappedPort(9000);

  process.env.S3_ENDPOINT = `http://${host}:${port}`;

  return container;
}

export async function stopContainers(
  ...containers: Array<StartedTestContainer | undefined>
) {
  await Promise.all(
    containers
      .filter((container): container is StartedTestContainer => !!container)
      .map((container) => container!.stop({ removeVolumes: true })),
  );
}
