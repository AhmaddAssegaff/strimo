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
  sha256Hex: string;
}

export class RecordChunkDto {
  @IsNotEmpty()
  @IsString()
  etag: string;

  @IsNotEmpty()
  @IsString()
  sha256Base64: string;
}
