import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString, IsUUID, Max, Min } from 'class-validator';

import { CreatePayment } from '../../../_contracts';

export class CreatePaymentDto implements CreatePayment {
  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  @IsUUID()
  public studentId?: string | null;

  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  @IsUUID()
  public groupId?: string | null;

  @ApiPropertyOptional()
  @IsInt()
  @Min(1)
  @Max(10_000_000)
  public amount: number;

  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  @IsString()
  public comment?: string | null;
}
