import { SetMetadata } from '@nestjs/common';
import { Roles } from '~app/modules/user/entities/user.entity';

export const ROLES_KEY = 'roles';
export const userRoles = (...roles: Roles[]) => SetMetadata(ROLES_KEY, roles);
