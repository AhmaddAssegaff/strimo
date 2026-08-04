import { VIDEO_STATUS, VIDEO_VISIBILITY } from '@prisma/client';
import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Max,
} from 'class-validator';

export class GetVideosDto {
  @IsNotEmpty()
  @IsNumber()
  @Max(10)
  @Max(1)
  page: number;

  @IsNotEmpty()
  @IsNumber()
  @Max(15)
  @Max(10)
  limit: number;

  @IsNotEmpty()
  @IsEnum(VIDEO_STATUS)
  status: VIDEO_STATUS;

  @IsOptional()
  @IsEnum(VIDEO_VISIBILITY)
  visibility?: VIDEO_VISIBILITY;

  @IsOptional()
  @IsString()
  search?: string;
}
