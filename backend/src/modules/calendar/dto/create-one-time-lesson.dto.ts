import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import {
  IsDateString,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Matches,
  Max,
  Min,
} from 'class-validator';

import { CreateOneTimeLesson } from '../../../_contracts/calendar';
import { CALENDAR_DURATION_MAX, CALENDAR_DURATION_MIN, CALENDAR_TIME_REGEXP } from '../constants';

export class CreateOneTimeLessonDto implements CreateOneTimeLesson {
  @ApiPropertyOptional({ nullable: true })
  @Expose()
  @IsOptional()
  @IsUUID()
  public studentId?: string;

  @ApiPropertyOptional({ nullable: true })
  @Expose()
  @IsOptional()
  @IsUUID()
  public groupId?: string;

  @ApiProperty()
  @Expose()
  @IsDateString()
  public date: string;

  @ApiProperty()
  @Expose()
  @IsString()
  @Matches(CALENDAR_TIME_REGEXP)
  public startTime: string;

  @ApiProperty()
  @Expose()
  @Type(() => Number)
  @IsInt()
  @Min(CALENDAR_DURATION_MIN)
  @Max(CALENDAR_DURATION_MAX)
  public duration: number;
}
