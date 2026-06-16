import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Status } from '~app/modules/user/entities/user.entity';

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
