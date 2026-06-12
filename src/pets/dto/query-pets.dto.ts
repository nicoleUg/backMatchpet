import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import { PetStatus } from '../interfaces/pet.interface';

export class QueryPetsDto {
  @ApiPropertyOptional({ example: 'dog' })
  @IsOptional()
  @IsString()
  species?: string;

  @ApiPropertyOptional({ enum: PetStatus, example: PetStatus.AVAILABLE })
  @IsOptional()
  @IsEnum(PetStatus)
  status?: PetStatus;

  @ApiPropertyOptional({ example: 'firebase-uid-owner' })
  @IsOptional()
  @IsString()
  ownerId?: string;

  @ApiPropertyOptional({ example: 'Luna' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ example: 'Labrador' })
  @IsOptional()
  @IsString()
  breed?: string;

  @ApiPropertyOptional({ example: 'female' })
  @IsOptional()
  @IsString()
  gender?: string;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @Transform(({ value }) => Number(value))
  @IsInt()
  @Min(0)
  @Max(40)
  minAge?: number;

  @ApiPropertyOptional({ example: 6 })
  @IsOptional()
  @Transform(({ value }) => Number(value))
  @IsInt()
  @Min(0)
  @Max(40)
  maxAge?: number;
}
