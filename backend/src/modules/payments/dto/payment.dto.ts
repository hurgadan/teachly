import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

import { Payment } from '../../../_contracts';

export class PaymentDto implements Payment {
  @ApiProperty()
  @Expose()
  public id: string;

  @ApiProperty()
  @Expose()
  public teacherId: string;

  @ApiPropertyOptional({ nullable: true })
  @Expose()
  public studentId: string | null;

  @ApiPropertyOptional({ nullable: true })
  @Expose()
  public groupId: string | null;

  @ApiProperty()
  @Expose()
  public amount: number;

  @ApiPropertyOptional({ nullable: true })
  @Expose()
  public comment: string | null;

  @ApiProperty()
  @Expose()
  public createdAt: string;
}
