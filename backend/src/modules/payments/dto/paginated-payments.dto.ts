import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';

import { PaymentDto } from './payment.dto';
import { PaginatedResponse } from '../../../_contracts';

export class PaginatedPaymentsDto implements PaginatedResponse<PaymentDto> {
  @ApiProperty({ type: [PaymentDto] })
  @Expose()
  @Type(() => PaymentDto)
  public items: PaymentDto[];

  @ApiProperty()
  @Expose()
  public total: number;

  @ApiProperty()
  @Expose()
  public page: number;

  @ApiProperty()
  @Expose()
  public limit: number;
}
