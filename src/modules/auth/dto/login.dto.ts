import { PickType } from '@nestjs/swagger';
import { registerDto } from './register.dto';

export class LoginDto extends PickType(registerDto, [
  'email',
  'password',
] as const) {}
