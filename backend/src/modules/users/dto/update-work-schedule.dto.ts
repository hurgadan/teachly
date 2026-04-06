import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsInt,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';

import {
  UpdateWorkSchedule,
  UpdateWorkScheduleItem,
} from '../../../_contracts';
import { WEEK_DAYS_COUNT } from '../constants';

import { WorkIntervalDto } from './work-interval.dto';

export class UpdateWorkScheduleItemDto implements UpdateWorkScheduleItem {
  @ApiProperty({ example: 0, description: '0 = Monday, 6 = Sunday' })
  @Expose()
  @IsInt()
  @Min(0)
  @Max(WEEK_DAYS_COUNT - 1)
  dayOfWeek: number;

  @ApiProperty()
  @Expose()
  @IsBoolean()
  isWorkday: boolean;

  @ApiProperty({ type: [WorkIntervalDto] })
  @Expose()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => WorkIntervalDto)
  intervals: WorkIntervalDto[];
}

export class UpdateWorkScheduleDto implements UpdateWorkSchedule {
  @ApiProperty({ type: [UpdateWorkScheduleItemDto] })
  @Expose()
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(WEEK_DAYS_COUNT)
  @ValidateNested({ each: true })
  @Type(() => UpdateWorkScheduleItemDto)
  schedules: UpdateWorkScheduleItemDto[];
}
