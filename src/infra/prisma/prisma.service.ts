import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaPg } from '@prisma/adapter-pg';
import { ConfigService } from '@nestjs/config';
import { CONSTANTS } from '~app/config';
import { PrismaClient } from '@prisma/client';
import { traceContext } from '@prisma/sqlcommenter-trace-context';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  constructor(config: ConfigService) {
    const adapter = new PrismaPg({
      connectionString: config.getOrThrow(CONSTANTS.DB.DATABASE_URL),
    });

    super({
      adapter,
      comments: [traceContext()],
    });
  }

  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }

  async ping(): Promise<void> {
    await this.$queryRaw`SELECT 1`;
  }
}
