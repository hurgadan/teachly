import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';

import { LessonStatus, UpdateLessonStatus } from '../../../_contracts/calendar';

export class UpdateLessonStatusDto implements UpdateLessonStatus {
  @ApiProperty({ enum: [LessonStatus.COMPLETED, LessonStatus.CANCELLED] })
  @IsEnum([LessonStatus.COMPLETED, LessonStatus.CANCELLED])
  public status: LessonStatus.COMPLETED | LessonStatus.CANCELLED;
}
