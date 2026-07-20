import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class VerifyAccountConfirmDto {
  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    description: 'User OTP',
    example: '572769',
  })
  token: string;
}
