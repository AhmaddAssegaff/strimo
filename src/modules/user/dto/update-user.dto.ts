import { IsNotEmpty, IsString } from 'class-validator';

export class UpdateUserProfileDto {
  @IsNotEmpty()
  @IsString()
  username: string;
}
