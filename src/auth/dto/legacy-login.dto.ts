import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

export class LegacyLoginDto {
  @ApiProperty({ example: 'juan_carlos' })
  @IsString()
  @MinLength(3)
  username: string;

  @ApiProperty({ example: 'juan_carlos_15' })
  @IsString()
  @MinLength(3)
  password: string;
}
