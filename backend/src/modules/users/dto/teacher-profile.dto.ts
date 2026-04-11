import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';

import { WorkScheduleDto } from './work-schedule.dto';
import { TransformToDateString } from '../../../_common/utils/decorators/transform-to-date-string.decorator';
import { Language, TeacherProfile } from '../../../_contracts';

export class TeacherProfileDto implements TeacherProfile {
  @ApiProperty()
  @Expose()
  id: string;

  @ApiProperty()
  @Expose()
  email: string;

  @ApiProperty({ nullable: true })
  @Expose()
  firstName: string | null;

  @ApiProperty({ nullable: true })
  @Expose()
  lastName: string | null;

  @ApiProperty({ nullable: true })
  @Expose()
  avatarData: string | null;

  @ApiProperty({ enum: Language })
  @Expose()
  language: Language;

  @ApiProperty()
  @Expose()
  timezone: string;

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
