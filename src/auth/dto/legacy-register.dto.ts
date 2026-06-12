import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength } from 'class-validator';

export class LegacyRegisterDto {
  @ApiProperty({ example: 'juan_carlos' })
  @IsString()
  @MinLength(3)
  username: string;

  @ApiProperty({ example: 'juan@test.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'Password123' })
  @IsString()
  @MinLength(6)
  password: string;
}
