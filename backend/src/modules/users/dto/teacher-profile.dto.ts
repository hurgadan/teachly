import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';

import { TransformToDateString } from '../../../_common/utils/decorators/transform-to-date-string.decorator';
import { Language, TeacherProfile } from '../../../_contracts';

import { WorkScheduleDto } from './work-schedule.dto';

export class TeacherProfileDto implements TeacherProfile {
  @ApiProperty()
  @Expose()
  id: string;

  @ApiProperty()
  @Expose()
  email: string;

  @ApiProperty({ enum: Language })
  @Expose()
  language: Language;

  @ApiProperty()
  @Expose()
  bufferMinutesAfterLesson: number;

  @ApiProperty({ type: [WorkScheduleDto] })
  @Expose()
  @Type(() => WorkScheduleDto)
  workSchedules: WorkScheduleDto[];

  @ApiProperty()
  @Expose()
  @TransformToDateString()
  createdAt: string;

  @ApiProperty()
  @Expose()
  @TransformToDateString()
  updatedAt: string;
}
