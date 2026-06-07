import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { Status } from '../entities/user.entity';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateStatusUserDto {
  @IsEnum(Status, {
    message: 'status must be one of: $constraints1',
  })
  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    description: 'New User status',
    enum: Status,
    example: Status.deactive,
  })
  status: Status;
}
