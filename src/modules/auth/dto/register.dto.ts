import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsPhoneNumber,
  IsString,
  MinLength,
} from 'class-validator';
import { Prisma } from '@prisma/client';

type UserCreateData = Prisma.UserCreateInput;

export class registerDto implements Partial<UserCreateData> {
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

  @IsNotEmpty()
  @IsPhoneNumber('ID')
  @ApiProperty({
    description: 'phone number user',
    example: '+6281234567890',
  })
  phone_number: string;
}
