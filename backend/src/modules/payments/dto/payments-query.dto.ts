import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsUUID, Max, Min } from 'class-validator';

export class PaymentsQueryDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  public studentId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  public groupId?: string;

  @ApiProperty({ default: 1 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  public page: number = 1;

  @ApiProperty({ default: 20 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  public limit: number = 20;
}
