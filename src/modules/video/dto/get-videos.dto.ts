import { VIDEO_STATUS, VIDEO_VISIBILITY } from '@prisma/client';
import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';

export class GetVideosDto {
  @IsOptional()
  @IsNumber()
  @Max(10)
  @Min(1)
  page: number = 1;

  @IsOptional()
  @IsNumber()
  @Max(15)
  @Min(10)
  limit: number = 10;

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
