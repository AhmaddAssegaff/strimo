import { Module } from '@nestjs/common';
import { AppController } from '~app/app.controller';
import { AppService } from '~app/app.service';
import { ConfigurationModule } from '~app/config/configuration.module';
import { PinoModule } from '~core/pino/pino.module';
import { HealthModule } from '~app/health/health.module';
import { RouterModule } from '~modules/router.module';
import { WorkerModule } from './core/worker/worker.module';
import { InfraModule } from './infra/infra.module';
import { SchedulerModule } from './core/scheduler/scheduler.module';

@Module({
  imports: [
    ConfigurationModule,
    InfraModule,
    PinoModule,
    HealthModule,
    WorkerModule,
    SchedulerModule,
    RouterModule.forRoot(),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
