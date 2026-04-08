import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { IsArray, IsInt, IsOptional, IsUUID, Max, Min, ValidateNested } from 'class-validator';

import { CreateRecurringLesson } from '../../../_contracts/calendar';
import { CALENDAR_DURATION_MAX, CALENDAR_DURATION_MIN } from '../constants';
import { RecurringLessonSlotDto } from './recurring-lesson-slot.dto';

export class CreateRecurringLessonDto implements CreateRecurringLesson {
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

  @ApiProperty({ type: [RecurringLessonSlotDto] })
  @Expose()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RecurringLessonSlotDto)
  public slots: RecurringLessonSlotDto[];
}
