import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PinoLogger } from 'nestjs-pino';
import { TempStorageService } from '../storage/temp/temp-storage.service';
import { readdir, rm, stat } from 'node:fs/promises';
import path from 'node:path';

const TEMP_DIR = path.resolve('.temp');
const MAX_AGE_TEMP_FILE = 24 * 60 * 60 * 1000;

@Injectable()
export class SchedulerService {
  constructor(
    private readonly pino: PinoLogger,
    private readonly tempStorage: TempStorageService,
  ) {}

  async cleanupLocalTempFiles() {
    this.pino.info('Running Corn job cleanup local temp files');

    const entries = await readdir(TEMP_DIR, {
      withFileTypes: true,
    });

    for (const entry of entries) {
      if (!entry.isDirectory()) {
        continue;
      }

      const dirPath = path.join(TEMP_DIR, entry.name);
      const metadata = await stat(dirPath);
      const age = Date.now() - metadata.mtimeMs;

      if (age >= MAX_AGE_TEMP_FILE) {
        await rm(dirPath, {
          recursive: true,
          force: true,
        });
      }
    }
  }

  async cleanUpBucketTempFiles() {
    this.pino.info('Running Corn job cleanup bucket temp files');

    await this.tempStorage.cleanUpBucketTemp();
  }

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async cleanupTempFiles() {
    await Promise.all([
      this.cleanupLocalTempFiles(),
      this.cleanUpBucketTempFiles(),
    ]);
  }
}
