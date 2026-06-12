import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength } from 'class-validator';

export class LoginDto {
  @ApiProperty({ example: 'patri@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ minLength: 6, example: 'pass1234' })
  @IsString()
  @MinLength(6)
  password: string;
}
