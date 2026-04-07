import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { IsArray, IsInt, IsOptional, IsUUID, Max, Min, ValidateNested } from 'class-validator';

import { CreateRecurringSchedule } from '../../../_contracts/calendar';
import { CALENDAR_DURATION_MAX, CALENDAR_DURATION_MIN } from '../constants';
import { ScheduleSlotDto } from './schedule-slot.dto';

export class CreateRecurringScheduleDto implements CreateRecurringSchedule {
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
  @Type(() => Number)
  @IsInt()
  @Min(CALENDAR_DURATION_MIN)
  @Max(CALENDAR_DURATION_MAX)
  public duration: number;

  @ApiProperty({ type: [ScheduleSlotDto] })
  @Expose()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ScheduleSlotDto)
  public slots: ScheduleSlotDto[];
}
