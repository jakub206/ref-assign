import { ApiProperty } from '@nestjs/swagger';
import { MatchOfficialRole } from '@prisma/client';
import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  IsArray,
  IsEnum,
  IsInt,
  Min,
  ValidateNested,
} from 'class-validator';

export class MatchAssignmentDto {
  @ApiProperty({ example: 12 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  refereeId!: number;

  @ApiProperty({ enum: MatchOfficialRole, example: MatchOfficialRole.REFEREE })
  @IsEnum(MatchOfficialRole)
  role!: MatchOfficialRole;
}

export class SetMatchAssignmentsDto {
  @ApiProperty({ type: [MatchAssignmentDto] })
  @IsArray()
  @ArrayMaxSize(6)
  @ValidateNested({ each: true })
  @Type(() => MatchAssignmentDto)
  assignments!: MatchAssignmentDto[];
}
