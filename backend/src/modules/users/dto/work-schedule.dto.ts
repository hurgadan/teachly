import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';

import { WorkIntervalDto } from './work-interval.dto';
import { WorkSchedule } from '../../../_contracts';

export class WorkScheduleDto implements WorkSchedule {
  @ApiProperty()
  @Expose()
  id: string;

  @ApiProperty({ example: 0, description: '0 = Monday, 6 = Sunday' })
  @Expose()
  dayOfWeek: number;

  @ApiProperty()
  @Expose()
  isWorkday: boolean;

  @ApiProperty({ type: [WorkIntervalDto] })
  @Expose()
  @Type(() => WorkIntervalDto)
  intervals: WorkIntervalDto[];
}
