import { Type } from 'class-transformer';
import { IsNotEmpty, IsNumber, IsString, Min } from 'class-validator';

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
  sizeBytes: number;

  @IsNotEmpty()
  @IsString()
  checksumSha256: string;
}

export class RecordChunkDto {
  @IsNotEmpty()
  @IsString()
  etag: string;
}
