import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsInt, IsOptional, IsString, Max, Min, MinLength } from 'class-validator';

export class CreatePetDto {
  @ApiProperty({ example: 'Luna' })
  @IsString()
  @MinLength(1)
  name: string;

  @ApiProperty({ example: 'dog' })
  @IsString()
  species: string;

  @ApiProperty({ example: 'female' })
  @IsString()
  gender: string;

  @ApiProperty({ example: 2 })
  @Transform(({ value }) => Number(value))
  @IsInt()
  @Min(0)
  @Max(40)
  age: number;

  @ApiProperty({ example: 'Labrador' })
  @IsString()
  breed: string;

  @ApiProperty({ example: 'Juguetona y sociable' })
  @IsString()
  personality: string;

  @ApiPropertyOptional({ example: 'https://example.com/pet.jpg' })
  @IsOptional()
  @IsString()
  photoUrl?: string;
}
