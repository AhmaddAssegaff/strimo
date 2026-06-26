import { ApiProperty } from '@nestjs/swagger';
import { Prisma } from '@prisma/client';
import { IsNotEmpty, IsString, IsEmail, MinLength } from 'class-validator';

type UserCreateData = Prisma.UserCreateInput;

export class CreateUserDto implements Partial<UserCreateData> {
  @IsNotEmpty()
  @IsString()
  @IsEmail()
  @ApiProperty({
    description: 'User email',
    example: 'Ahmad@gmail.com',
  })
  email: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(8)
  @ApiProperty({
    description: 'User password',
    example: 'Ahmad123',
  })
  password: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(8)
  @ApiProperty({
    description: 'username user',
    example: 'Ahmad assegaff',
  })
  username: string;
}
