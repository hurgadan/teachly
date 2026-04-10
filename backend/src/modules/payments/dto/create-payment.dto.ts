import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsInt, IsOptional, IsString, IsUUID, Max, Min } from 'class-validator';

import { CreatePayment, PaymentType } from '../../../_contracts';

export class CreatePaymentDto implements CreatePayment {
  @ApiProperty()
  @IsUUID()
  public studentId: string;

  @ApiProperty()
  @IsInt()
  @Min(1)
  @Max(100)
  public lessonsCount: number;

  @ApiProperty({ enum: ['prepaid', 'postpaid'] })
  @IsEnum(['prepaid', 'postpaid'])
  public type: PaymentType;

  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  @IsString()
  public comment?: string | null;
}
