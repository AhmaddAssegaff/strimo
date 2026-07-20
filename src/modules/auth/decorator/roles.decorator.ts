import { SetMetadata } from '@nestjs/common';
import { USER_ROLES } from '@prisma/client';

export const ROLES_KEY = 'roles';
export const userRoles = (...roles: USER_ROLES[]) =>
  SetMetadata(ROLES_KEY, roles);
