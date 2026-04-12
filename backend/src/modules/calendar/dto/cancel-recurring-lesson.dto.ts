import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { IsDateString } from 'class-validator';

import { CancelRecurringLesson } from '../../../_contracts/calendar';

export class CancelRecurringLessonDto implements CancelRecurringLesson {
  @ApiProperty({ example: '2026-04-14' })
  @Expose()
  @IsDateString()
  public cancelFrom: string;
}
