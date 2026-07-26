import { IsNotEmpty, IsString } from 'class-validator';

export class CreateChannelDto {
  @IsNotEmpty()
  @IsString()
  channelTitle: string;

  @IsNotEmpty()
  @IsString()
  channelDescription: string;
}
