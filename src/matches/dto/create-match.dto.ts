import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { MatchStatus } from '@prisma/client';
import {
  IsDateString,
  IsEnum,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateMatchDto {
  @ApiProperty({ example: 'FC Barcelona' })
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  homeTeam!: string;

  @ApiProperty({ example: 'Real Madrid' })
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  awayTeam!: string;

  @ApiProperty({ example: '2026-10-12T16:00:00.000Z' })
  @IsDateString()
  date!: string;

  @ApiPropertyOptional({ example: 'La Liga' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  competition?: string;

  @ApiPropertyOptional({ example: 'Camp Nou' })
  @IsOptional()
  @IsString()
  @MaxLength(150)
  venue?: string;

  @ApiPropertyOptional({ enum: MatchStatus, default: MatchStatus.SCHEDULED })
  @IsOptional()
  @IsEnum(MatchStatus)
  status?: MatchStatus;
}
