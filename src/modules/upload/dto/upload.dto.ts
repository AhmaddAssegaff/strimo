import { Type } from 'class-transformer';
import { IsNotEmpty, IsNumber, IsString, Max, Min } from 'class-validator';

const MAX_FILE_SIZE = 16 * 1024 * 1024 * 1024; // 16 GiB

export class InitiateUploadDto {
  @IsString()
  @IsNotEmpty()
  filename: string;

  @IsString()
  @IsNotEmpty()
  mimeType: string;

  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(MAX_FILE_SIZE)
  sizeBytes: number;
}

export class RecordChunkDto {
  @IsNotEmpty()
  @IsString()
  etag: string;

  @IsNotEmpty()
  @IsString()
  sha256Base64: string;
}
