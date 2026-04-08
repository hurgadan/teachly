import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { IsDateString, IsInt, IsString, Matches, Max, Min } from 'class-validator';

import { RecurringLessonSlot } from '../../../_contracts/calendar';
import {
  CALENDAR_DAY_OF_WEEK_MAX,
  CALENDAR_DAY_OF_WEEK_MIN,
  CALENDAR_TIME_REGEXP,
} from '../constants';

export class RecurringLessonSlotDto implements RecurringLessonSlot {
  @ApiProperty()
  @Expose()
  @IsDateString()
  public date: string;

  @ApiProperty()
  @Expose()
  @Type(() => Number)
  @IsInt()
  @Min(CALENDAR_DAY_OF_WEEK_MIN)
  @Max(CALENDAR_DAY_OF_WEEK_MAX)
  public dayOfWeek: number;

  @ApiProperty()
  @Expose()
  @IsString()
  @Matches(CALENDAR_TIME_REGEXP)
  public startTime: string;
}
