import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { IsString, Matches } from 'class-validator';

import { WorkInterval } from '../../../_contracts';

export class WorkIntervalDto implements WorkInterval {
  @ApiProperty({ example: '09:00' })
  @Expose()
  @IsString()
  @Matches(/^([01]\d|2[0-3]):(00|15|30|45)$/, {
    message: 'startTime must be in HH:MM format with 15-min step',
  })
  startTime: string;

  @ApiProperty({ example: '18:00' })
  @Expose()
  @IsString()
  @Matches(/^([01]\d|2[0-3]):(00|15|30|45)$/, {
    message: 'endTime must be in HH:MM format with 15-min step',
  })
  endTime: string;
}
