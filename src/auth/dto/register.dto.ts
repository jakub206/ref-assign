import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsEmail, IsString, MaxLength, MinLength } from 'class-validator';
import { normalizeEmail } from './normalize-email';

export class RegisterDto {
  @ApiProperty({ example: 's.edzia@example.com' })
  @Transform(({ value }) => normalizeEmail(value))
  @IsEmail()
  @MaxLength(254)
  email!: string;

  @ApiProperty({ example: 'BezpieczneHaslo123', minLength: 8, maxLength: 72 })
  @IsString()
  @MinLength(8)
  @MaxLength(72)
  password!: string;
}
