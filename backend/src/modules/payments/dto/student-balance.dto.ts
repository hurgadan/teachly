import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

import { StudentBalance } from '../../../_contracts';

export class StudentBalanceDto implements StudentBalance {
  @ApiProperty()
  @Expose()
  public studentId: string;

  @ApiProperty()
  @Expose()
  public totalPaid: number;

  @ApiProperty()
  @Expose()
  public totalCharged: number;

  @ApiProperty()
  @Expose()
  public balance: number;

  @ApiProperty()
  @Expose()
  public paidLessonsCount: number;

  @ApiProperty()
  @Expose()
  public unpaidLessons: number;

  @ApiProperty()
  @Expose()
  public isOverdue: boolean;
}
