import { DynamicModule, ForwardReference, Module, Type } from '@nestjs/common';
import { AuthModule } from '~modules/auth/auth.module';
import { UserModule } from '~modules/user/user.module';
import { ChannelModule } from '~modules/channel/channel.module';
import { NotificationModule } from '~modules/notification/notification.module';
import { VideoModule } from '~modules/video/video.module';
import { UploadModule } from '~modules/upload/upload.module';

@Module({})
export class RouterModule {
  static forRoot(): DynamicModule {
    const imports: (
      DynamicModule | Type<any> | Promise<DynamicModule> | ForwardReference<any>
    )[] = [];
    imports.push(
      AuthModule,
      UserModule,
      ChannelModule,
      NotificationModule,
      VideoModule,
      UploadModule,
    );
    return {
      module: RouterModule,
      providers: [],
      controllers: [],
      imports,
    };
  }
}
