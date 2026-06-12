import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString, MinLength } from 'class-validator';

export class RegisterDto {
  @ApiProperty({ example: 'Patricio Gomez' })
  @IsString()
  @MinLength(2)
  fullName: string;

  @ApiProperty({ example: 'patri@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ minLength: 6, example: 'pass1234' })
  @IsString()
  @MinLength(6)
  password: string;

  @ApiProperty({ required: false, example: 'Pato' })
  @IsOptional()
  @IsString()
  displayName?: string;
}
