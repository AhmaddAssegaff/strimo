import { DynamicModule, ForwardReference, Module, Type } from '@nestjs/common';
import { AuthModule } from '~modules/auth/auth.module';
import { UserModule } from '~modules/user/user.module';

@Module({})
export class RouterModule {
  static forRoot(): DynamicModule {
    const imports: (
      | DynamicModule
      | Type<any>
      | Promise<DynamicModule>
      | ForwardReference<any>
    )[] = [];
    imports.push(AuthModule, UserModule);
    return {
      module: RouterModule,
      providers: [],
      controllers: [],
      imports,
    };
  }
}
