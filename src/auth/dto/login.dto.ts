import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsEmail, IsString, MaxLength } from 'class-validator';
import { normalizeEmail } from './normalize-email';

export class LoginDto {
  @ApiProperty({ example: 's.edzia@example.com' })
  @Transform(({ value }) => normalizeEmail(value))
  @IsEmail()
  @MaxLength(254)
  email!: string;

  @ApiProperty({ example: 'BezpieczneHaslo123' })
  @IsString()
  @MaxLength(72)
  password!: string;
}
