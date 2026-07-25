import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import {
  AuthenticatedRequest,
  AuthenticatedUser,
} from '~app/modules/auth/auth.interface';

export const CurrentUser = createParamDecorator(
  <K extends keyof AuthenticatedUser = keyof AuthenticatedUser>(
    data: K | undefined,
    ctx: ExecutionContext,
  ): AuthenticatedUser[K] | AuthenticatedUser => {
    const request = ctx.switchToHttp().getRequest<AuthenticatedRequest>();
    const user = request.user;

    return data ? user[data] : user;
  },
);
