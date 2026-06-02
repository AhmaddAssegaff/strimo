import { ApiProperty } from '@nestjs/swagger';
import { User } from '../entities/user.entity';
import { IsNotEmpty, IsString, IsEmail, MinLength } from 'class-validator';

export class CreateUserDto implements Partial<User> {
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
