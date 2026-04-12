import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
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

import { RescheduleRecurringLesson } from '../../../_contracts/calendar';
import { CALENDAR_DURATION_MAX, CALENDAR_DURATION_MIN } from '../constants';

export class RescheduleRecurringLessonDto implements RescheduleRecurringLesson {
  @ApiProperty({ example: '2026-04-14' })
  @Expose()
  @IsDateString()
  public cancelFrom: string;

  @ApiProperty({ example: 1 })
  @Expose()
  @IsInt()
  @Min(0)
  @Max(6)
  public dayOfWeek: number;

  @ApiProperty({ example: '10:00' })
  @Expose()
  @IsString()
  @Matches(/^\d{2}:\d{2}$/)
  public startTime: string;

  @ApiProperty()
  @Expose()
  @IsInt()
  @Min(CALENDAR_DURATION_MIN)
  @Max(CALENDAR_DURATION_MAX)
  public duration: number;

  @ApiPropertyOptional()
  @Expose()
  @IsOptional()
  @IsUUID()
  public studentId?: string;

  @ApiPropertyOptional()
  @Expose()
  @IsOptional()
  @IsUUID()
  public groupId?: string;
}
