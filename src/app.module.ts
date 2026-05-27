import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigurationModule } from './modules/common/configuration.module';
import { DatabaseModule } from './modules/common/database.module';
import { MailModule } from './modules/common/mailer.module';

@Module({
  imports: [ConfigurationModule, DatabaseModule, MailModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
