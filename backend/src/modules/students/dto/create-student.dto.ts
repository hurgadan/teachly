import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import {
  IsDateString,
  IsEmail,
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

import { CreateStudent } from '../../../_contracts';
import {
  STUDENT_CONTACT_MAX_LENGTH,
  STUDENT_DURATION_MAX,
  STUDENT_DURATION_MIN,
  STUDENT_NAME_MAX_LENGTH,
  STUDENT_PRICE_MAX,
  STUDENT_PRICE_MIN,
} from '../constants';

export class CreateStudentDto implements CreateStudent {
  @ApiProperty()
  @Expose()
  @IsString()
  @MaxLength(STUDENT_NAME_MAX_LENGTH)
  public firstName: string;

  @ApiPropertyOptional({ nullable: true })
  @Expose()
  @IsOptional()
  @IsString()
  @MaxLength(STUDENT_NAME_MAX_LENGTH)
  public lastName?: string | null;

  @ApiPropertyOptional({ nullable: true })
  @Expose()
  @IsOptional()
  @IsString()
  @MaxLength(STUDENT_CONTACT_MAX_LENGTH)
  public phone?: string | null;

  @ApiPropertyOptional({ nullable: true })
  @Expose()
  @IsOptional()
  @IsEmail()
  @MaxLength(STUDENT_CONTACT_MAX_LENGTH)
  public email?: string | null;

  @ApiPropertyOptional({ nullable: true })
  @Expose()
  @IsOptional()
  @IsString()
  @MaxLength(STUDENT_CONTACT_MAX_LENGTH)
  public telegram?: string | null;

  @ApiProperty()
  @Expose()
  @IsInt()
  @Min(STUDENT_PRICE_MIN)
  @Max(STUDENT_PRICE_MAX)
  public price: number;

  @ApiProperty()
  @Expose()
  @IsInt()
  @Min(STUDENT_DURATION_MIN)
  @Max(STUDENT_DURATION_MAX)
  public duration: number;

  @ApiPropertyOptional({ nullable: true })
  @Expose()
  @IsOptional()
  @IsDateString()
  public startDate?: string | null;

  @ApiPropertyOptional({ nullable: true })
  @Expose()
  @IsOptional()
  @IsString()
  public comment?: string | null;
}
