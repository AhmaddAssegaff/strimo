import { IsNotEmpty, IsString } from 'class-validator';

export class UpdateUserProfile {
  @IsNotEmpty()
  @IsString()
  username: string;
}
