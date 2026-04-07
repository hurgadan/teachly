import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { IsDateString, IsInt, Max, Min } from 'class-validator';

import { CALENDAR_DURATION_MAX, CALENDAR_DURATION_MIN } from '../constants';

export class AvailableSlotsQueryDto {
  @ApiProperty()
  @Expose()
  @IsDateString()
  public startDate: string;

  @ApiProperty()
  @Expose()
  @Type(() => Number)
  @IsInt()
  @Min(CALENDAR_DURATION_MIN)
  @Max(CALENDAR_DURATION_MAX)
  public duration: number;
}
