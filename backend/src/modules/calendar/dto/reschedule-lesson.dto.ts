import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { IsDateString, IsString, Matches } from 'class-validator';

import { RescheduleLesson } from '../../../_contracts/calendar';

export class RescheduleLessonDto implements RescheduleLesson {
  @ApiProperty({ example: '2026-04-14' })
  @Expose()
  @IsDateString()
  public date: string;

  @ApiProperty({ example: '10:00' })
  @Expose()
  @IsString()
  @Matches(/^\d{2}:\d{2}$/)
  public startTime: string;
}
