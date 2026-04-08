import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

import { AvailableSlot } from '../../../_contracts/calendar';

export class AvailableSlotDto implements AvailableSlot {
  @ApiProperty()
  @Expose()
  public date: string;

  @ApiProperty()
  @Expose()
  public dayOfWeek: number;

  @ApiProperty()
  @Expose()
  public startTime: string;
}
