import { IsEnum, IsNotEmpty } from 'class-validator';
import { CreateVideoDto } from './create-video.dto';
import { VIDEO_VISIBILITY } from '@prisma/client';

export class UpdateVideoDto extends CreateVideoDto {
  @IsNotEmpty()
  @IsEnum(VIDEO_VISIBILITY)
  visibility: VIDEO_VISIBILITY;
}
